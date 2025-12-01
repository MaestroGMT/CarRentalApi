namespace CarRentalApi.DTO
{
    public class SignupDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }

    public class UpdateProfileDto
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }
}
