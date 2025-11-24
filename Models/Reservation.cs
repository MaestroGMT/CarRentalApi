namespace CarRentalApi.Models;

public class Reservation
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = "";
    public DateTime DateFrom { get; set; }
    public DateTime DateTo { get; set; }

    public int CarId { get; set; }
    public Car? Car { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
