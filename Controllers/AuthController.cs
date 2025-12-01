using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CarRentalApi.Data;
using CarRentalApi.DTO;
using CarRentalApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CarRentalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private int GetUserIdFromToken()
        {
            var idClaim =
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
                throw new UnauthorizedAccessException("User id claim not found.");

            return userId;
        }

        // POST: api/Auth/signup
        [HttpPost("signup")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Signup([FromBody] SignupDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Username and password are required.");

            var existing = await _context.Users.AnyAsync(u => u.Username == dto.Username);
            if (existing)
                return BadRequest("User with this username already exists.");

            var user = new User
            {
                Username = dto.Username,
                Password = dto.Password,
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User created" });
        }

        private async Task<string> CreateRefreshToken(User user)
        {
            var refreshToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                                + Convert.ToBase64String(Guid.NewGuid().ToByteArray());

            var entity = new RefreshToken
            {
                Token = refreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(14) // refresh galioja 14 dienų
            };

            _context.RefreshTokens.Add(entity);
            await _context.SaveChangesAsync();

            return refreshToken;
        }

        // POST: api/Auth/refresh
        [HttpPost("refresh")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto dto)
        {
            var tokenEntity = await _context.RefreshTokens
                .Include(rt => rt.User)
                .SingleOrDefaultAsync(rt => rt.Token == dto.RefreshToken);

            if (tokenEntity == null || tokenEntity.Revoked || tokenEntity.ExpiresAt < DateTime.UtcNow)
                return Unauthorized("Invalid refresh token.");

            // ✅ ROTACIJA: seną refresh atšaukiam
            tokenEntity.Revoked = true;

            var newAccessToken = GenerateJwtToken(tokenEntity.User);
            var newRefreshToken = await CreateRefreshToken(tokenEntity.User);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken
            });
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null || user.Password != dto.Password)
                return Unauthorized("Invalid username or password.");

            var accessToken = GenerateJwtToken(user);
            var refreshToken = await CreateRefreshToken(user);

            return Ok(new
            {
                accessToken,
                refreshToken
            });
        }
        // POST: api/Auth/logout
        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Logout([FromBody] RefreshRequestDto dto)
        {
            var tokenEntity = await _context.RefreshTokens
                .SingleOrDefaultAsync(rt => rt.Token == dto.RefreshToken);

            if (tokenEntity != null)
            {
                tokenEntity.Revoked = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Logged out" });
        }

        // GET: api/Auth/me
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<ProfileDto>> Me()
        {
            var userId = GetUserIdFromToken();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            return Ok(new ProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role
            });
        }

        // PATCH: api/Auth/me
        [HttpPatch("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<ProfileDto>> UpdateMe([FromBody] UpdateProfileDto dto)
        {
            var userId = GetUserIdFromToken();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            if (!string.IsNullOrWhiteSpace(dto.Username))
            {
                var newUsername = dto.Username.Trim();
                if (!string.Equals(newUsername, user.Username, StringComparison.OrdinalIgnoreCase))
                {
                    var exists = await _context.Users.AnyAsync(u =>
                        u.Id != userId && u.Username.ToLower() == newUsername.ToLower());
                    if (exists)
                        return Conflict("Username is already taken.");

                    user.Username = newUsername;
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.Password = dto.Password;
            }

            await _context.SaveChangesAsync();

            return Ok(new ProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role
            });
        }


        private string GenerateJwtToken(User user)
        {
            var jwtSection = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSection["Issuer"],
                audience: jwtSection["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSection["ExpiresMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
