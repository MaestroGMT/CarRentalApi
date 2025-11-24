using CarRentalApi.Data;
using CarRentalApi.DTO;
using CarRentalApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace CarRentalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class CarsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/Cars
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CarDto>>> GetCars()
        {
            var cars = await _context.Cars.Include(c => c.CarClass).ToListAsync();
            var result = cars.Select(c => new CarDto
            {
                Id = c.Id,
                PlateNumber = c.PlateNumber,
                Brand = c.Brand,
                Model = c.Model,
                IsAvailable = c.IsAvailable,
                CarClassId = c.CarClassId,
                CarClassName = c.CarClass?.Name
            });
            return Ok(result);
        }

        // GET /api/Cars/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CarDto>> GetCarById(int id)
        {
            var car = await _context.Cars.Include(c => c.CarClass)
                                         .FirstOrDefaultAsync(c => c.Id == id);
            if (car == null) return NotFound();

            var dto = new CarDto
            {
                Id = car.Id,
                PlateNumber = car.PlateNumber,
                Brand = car.Brand,
                Model = car.Model,
                IsAvailable = car.IsAvailable,
                CarClassId = car.CarClassId,
                CarClassName = car.CarClass?.Name
            };
            return Ok(dto);
        }

        // POST /api/Cars
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CarDto>> CreateCar([FromBody] CarCreateDto dto)
        {
            var carClass = await _context.CarClasses.FindAsync(dto.CarClassId);
            if (carClass == null)
                return BadRequest($"CarClass with Id {dto.CarClassId} not found.");

            var plate = dto.PlateNumber.Trim();
            var exists = await _context.Cars
                .AnyAsync(c => c.PlateNumber.ToLower() == plate.ToLower());
            if (exists)
                return Conflict($"Car with plate number '{plate}' already exists."); // 409 logiškiau

            var car = new Car
            {
                PlateNumber = plate,
                Brand = dto.Brand,
                Model = dto.Model,
                IsAvailable = dto.IsAvailable,
                CarClassId = dto.CarClassId
            };

            _context.Cars.Add(car);
            await _context.SaveChangesAsync();

            var result = new CarDto
            {
                Id = car.Id,
                PlateNumber = car.PlateNumber,
                Brand = car.Brand,
                Model = car.Model,
                IsAvailable = car.IsAvailable,
                CarClassId = car.CarClassId,
                CarClassName = carClass.Name
            };

            return CreatedAtAction(nameof(GetCarById), new { id = car.Id }, result);
        }

        // DELETE /api/Cars/{id}
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCar(int id)
        {
            var car = await _context.Cars.FindAsync(id);
            if (car == null) return NotFound();

            _context.Cars.Remove(car);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT /api/Cars/{id}
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CarDto>> UpdateCar(int id, [FromBody] CarCreateDto dto)
        {
            var car = await _context.Cars.FindAsync(id);
            if (car == null) return NotFound();

            var carClass = await _context.CarClasses.FindAsync(dto.CarClassId);
            if (carClass == null)
                return BadRequest($"CarClass with Id {dto.CarClassId} not found.");

            var plate = dto.PlateNumber.Trim();
            var exists = await _context.Cars
                .AnyAsync(c => c.Id != id && c.PlateNumber.ToLower() == plate.ToLower());
            if (exists)
                return Conflict($"Car with plate number '{plate}' already exists.");

            car.PlateNumber = plate;
            car.Brand = dto.Brand;
            car.Model = dto.Model;
            car.IsAvailable = dto.IsAvailable;
            car.CarClassId = dto.CarClassId;

            await _context.SaveChangesAsync();

            var result = new CarDto
            {
                Id = car.Id,
                PlateNumber = car.PlateNumber,
                Brand = car.Brand,
                Model = car.Model,
                IsAvailable = car.IsAvailable,
                CarClassId = car.CarClassId,
                CarClassName = carClass.Name
            };

            return Ok(result);
        }
    }
}
