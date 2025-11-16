using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRentalApi.Models
{
    public class Car
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string PlateNumber { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;

        public bool IsAvailable { get; set; } = true;

        // Foreign key į CarClass
        public int CarClassId { get; set; }
        public CarClass? CarClass { get; set; }
    }
}
