using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalApi.Data;
using CarRentalApi.Models;
using CarRentalApi.DTO;
using Microsoft.AspNetCore.Authorization;


namespace CarRentalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "User,Admin")]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservationsController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var idClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier) // dažniausiai čia atsiduria sub
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub); // jei map’inimas išjungtas

        if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
            throw new UnauthorizedAccessException("User id claim not found in token.");

        return userId;
    }


    private bool IsAdmin() => User.IsInRole("Admin");

    // GET: api/Reservations
    // Admin - visas, User - tik savo
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetReservations()
    {
        IQueryable<Reservation> query = _context.Reservations
            .Include(r => r.Car);

        if (!IsAdmin())
        {
            int userId = GetUserId();
            query = query.Where(r => r.UserId == userId);
        }

        var reservations = await query.ToListAsync();

        var result = reservations.Select(r => new ReservationDto
        {
            Id = r.Id,
            CustomerName = r.CustomerName,
            DateFrom = r.DateFrom,
            DateTo = r.DateTo,
            CarId = r.CarId,
            CarPlateNumber = r.Car.PlateNumber,
            UserId = r.UserId
        });

        return Ok(result);
    }

    // GET: api/Reservations/{id}
    // Admin - gali matyt bet ką, User - tik savo
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReservationDto>> GetReservation(int id)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Car)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reservation == null) return NotFound();

        if (!IsAdmin() && reservation.UserId != GetUserId())
            return Forbid(); // 403

        var dto = new ReservationDto
        {
            Id = reservation.Id,
            CustomerName = reservation.CustomerName,
            DateFrom = reservation.DateFrom,
            DateTo = reservation.DateTo,
            CarId = reservation.CarId,
            CarPlateNumber = reservation.Car.PlateNumber,
            UserId = reservation.UserId
        };

        return Ok(dto);
    }

    // POST: api/Reservations
    // User sukuria savo vardu (UserId iš tokeno)
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReservationDto>> CreateReservation([FromBody] ReservationCreateDto dto)
    {
        if (dto.DateFrom >= dto.DateTo)
            return BadRequest("DateFrom must be earlier than DateTo.");

        var car = await _context.Cars.FindAsync(dto.CarId);
        if (car == null)
            return BadRequest($"Car with Id {dto.CarId} not found.");

        var overlaps = await _context.Reservations.AnyAsync(r =>
            r.CarId == dto.CarId &&
            r.DateFrom < dto.DateTo &&
            dto.DateFrom < r.DateTo
        );

        if (overlaps)
            return Conflict("Car is already reserved for the selected dates.");

        int userId = GetUserId();

        var reservation = new Reservation
        {
            CustomerName = dto.CustomerName,
            DateFrom = dto.DateFrom,
            DateTo = dto.DateTo,
            CarId = dto.CarId,
            UserId = userId
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        var result = new ReservationDto
        {
            Id = reservation.Id,
            CustomerName = reservation.CustomerName,
            DateFrom = reservation.DateFrom,
            DateTo = reservation.DateTo,
            CarId = reservation.CarId,
            CarPlateNumber = car.PlateNumber,
            UserId = reservation.UserId
        };

        return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, result);
    }

    // PATCH: api/Reservations/{id}
    // User gali keisti tik savo
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReservationDto>> UpdateReservation(int id, [FromBody] ReservationCreateDto updateDto)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Car)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reservation == null) return NotFound();

        if (!IsAdmin() && reservation.UserId != GetUserId())
            return Forbid();

        if (updateDto.DateFrom >= updateDto.DateTo)
            return BadRequest("DateFrom must be earlier than DateTo.");

        var overlaps = await _context.Reservations.AnyAsync(r =>
            r.Id != id &&
            r.CarId == reservation.CarId &&
            r.DateFrom < updateDto.DateTo &&
            updateDto.DateFrom < r.DateTo
        );

        if (overlaps)
            return Conflict("Car is already reserved for the selected dates.");

        reservation.CustomerName = updateDto.CustomerName;
        reservation.DateFrom = updateDto.DateFrom;
        reservation.DateTo = updateDto.DateTo;

        await _context.SaveChangesAsync();

        var result = new ReservationDto
        {
            Id = reservation.Id,
            CustomerName = reservation.CustomerName,
            DateFrom = reservation.DateFrom,
            DateTo = reservation.DateTo,
            CarId = reservation.CarId,
            CarPlateNumber = reservation.Car.PlateNumber,
            UserId = reservation.UserId
        };

        return Ok(result);
    }

    // DELETE: api/Reservations/{id}
    // User gali trinti tik savo
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return NotFound();

        if (!IsAdmin() && reservation.UserId != GetUserId())
            return Forbid();

        _context.Reservations.Remove(reservation);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
