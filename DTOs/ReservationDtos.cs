namespace CarRentalApi.DTO
{
    public class ReservationCreateDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public int CarId { get; set; }
    }

    public class ReservationDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public int CarId { get; set; }
        public string CarPlateNumber { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
}
