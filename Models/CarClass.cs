namespace CarRentalApi.Models;

public class CarClass
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";

    // Ryšys: viena klasė turi daug automobilių
    public ICollection<Car>? Cars { get; set; }
}
