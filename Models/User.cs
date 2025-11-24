using System.ComponentModel.DataAnnotations;

namespace CarRentalApi.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "User";
        public List<RefreshToken> RefreshTokens { get; set; } = new();

    }
}
