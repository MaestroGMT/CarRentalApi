using System.ComponentModel.DataAnnotations;

namespace CarRentalApi.Models
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }

        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool Revoked { get; set; } = false;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
