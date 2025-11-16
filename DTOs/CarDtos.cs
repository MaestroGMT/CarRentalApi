namespace CarRentalApi.DTO
{
    public class CarDto
    {
        public int Id { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;

        public bool IsAvailable { get; set; }
        public int CarClassId { get; set; }
        public string? CarClassName { get; set; }
    }
        public class CarCreateDto
    {
        public string PlateNumber { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
        public int CarClassId { get; set; }
    }
}
