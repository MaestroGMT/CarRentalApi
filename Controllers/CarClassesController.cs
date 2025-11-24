using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalApi.Data;
using CarRentalApi.Models;
using CarRentalApi.DTO;
using Microsoft.AspNetCore.Authorization;

namespace CarRentalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CarClassesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CarClassesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/CarClasses
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CarClassDto>>> GetCarClasses()
    {
        var classes = await _context.CarClasses.ToListAsync();

        var result = classes.Select(c => new CarClassDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description
        });

        return Ok(result);
    }

    // GET: api/CarClasses/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CarClassDto>> GetCarClass(int id)
    {
        var carClass = await _context.CarClasses.FindAsync(id);
        if (carClass == null) return NotFound();

        var result = new CarClassDto
        {
            Id = carClass.Id,
            Name = carClass.Name,
            Description = carClass.Description
        };

        return Ok(result);
    }

    // GET: /api/CarClasses/{id}/Cars
    [HttpGet("{id}/Cars")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<CarDto>>> GetCarsByClass(int id)
    {
        var carClass = await _context.CarClasses.FindAsync(id);
        if (carClass == null) return NotFound($"Car class with id {id} not found.");

        var cars = await _context.Cars
            .Where(c => c.CarClassId == id)
            .Select(c => new CarDto
            {
                Id = c.Id,
                PlateNumber = c.PlateNumber,
                Brand = c.Brand,
                Model = c.Model,
                CarClassId = c.CarClassId,
            })
            .ToListAsync();

        return Ok(cars);
    }

    // POST: api/CarClasses
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CarClassDto>> CreateCarClass([FromBody] CarClassCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required.");

        var name = dto.Name.Trim();

        var exists = await _context.CarClasses
            .AnyAsync(c => c.Name.ToLower() == name.ToLower());

        if (exists)
            return Conflict($"Car class with name '{name}' already exists."); // 409 logiškiau

        var carClass = new CarClass
        {
            Name = name,
            Description = dto.Description
        };

        _context.CarClasses.Add(carClass);
        await _context.SaveChangesAsync();

        var result = new CarClassDto
        {
            Id = carClass.Id,
            Name = carClass.Name,
            Description = carClass.Description
        };

        return CreatedAtAction(nameof(GetCarClass), new { id = carClass.Id }, result);
    }

    // PUT: api/CarClasses/{id}
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCarClass(int id, [FromBody] CarClassCreateDto dto)
    {
        var carClass = await _context.CarClasses.FindAsync(id);
        if (carClass == null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name cannot be empty.");

        var name = dto.Name.Trim();

        var exists = await _context.CarClasses
            .AnyAsync(c => c.Id != id && c.Name.ToLower() == name.ToLower());

        if (exists)
            return Conflict($"Car class with name '{name}' already exists."); // 409

        carClass.Name = name;
        carClass.Description = dto.Description;

        await _context.SaveChangesAsync();

        var result = new CarClassDto
        {
            Id = carClass.Id,
            Name = carClass.Name,
            Description = carClass.Description
        };

        return Ok(result);
    }

    // DELETE: api/CarClasses/{id}
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCarClass(int id)
    {
        var carClass = await _context.CarClasses.FindAsync(id);
        if (carClass == null) return NotFound();

        _context.CarClasses.Remove(carClass);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
