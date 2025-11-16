using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalApi.Data;
using CarRentalApi.Models;
using CarRentalApi.DTO;
using Microsoft.AspNetCore.Authorization;

namespace CarRentalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "User,Admin")]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservationsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Reservations
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetReservations()
    {
        var reservations = await _context.Reservations
            .Include(r => r.Car)
            .ThenInclude(c => c.CarClass)
            .ToListAsync();

        var result = reservations.Select(r => new ReservationDto
        {
            Id = r.Id,
            CustomerName = r.CustomerName,
            DateFrom = r.DateFrom,
            DateTo = r.DateTo,
            CarId = r.CarId,
            CarPlateNumber = r.Car.PlateNumber
        });

        return Ok(result);
    }

    // GET: api/Reservations/{id}
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReservationDto>> GetReservation(int id)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Car)
            .ThenInclude(c => c.CarClass)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reservation == null) return NotFound();

        var result = new ReservationDto
        {
            Id = reservation.Id,
            CustomerName = reservation.CustomerName,
            DateFrom = reservation.DateFrom,
            DateTo = reservation.DateTo,
            CarId = reservation.CarId,
            CarPlateNumber = reservation.Car.PlateNumber
        };

        return Ok(result);
    }

    // POST: api/Reservations
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReservationDto>> CreateReservation([FromBody] ReservationCreateDto dto)
    {
        var car = await _context.Cars.FindAsync(dto.CarId);
        if (car == null)
        {
            return BadRequest($"Car with Id {dto.CarId} not found.");
        }
        var exists = await _context.Reservations.AnyAsync(c => c.CarId == dto.CarId);
        if (exists)
            return BadRequest($"Reservation with car number '{dto.CarId}' already exists.");
        var reservation = new Reservation
        {
            CustomerName = dto.CustomerName,
            DateFrom = dto.DateFrom,
            DateTo = dto.DateTo,
            CarId = dto.CarId
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        var result = new ReservationDto
        {
            Id = reservation.Id,
            CustomerName = reservation.CustomerName,
            DateFrom = reservation.DateFrom,
            DateTo = reservation.DateTo,
            CarId = reservation.CarId,
            CarPlateNumber = car.PlateNumber
        };

        return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, result);
    }

    // PATCH: api/Reservations/{id}
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateReservation(int id, [FromBody] ReservationCreateDto updateDto)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return NotFound();

        reservation.CustomerName = updateDto.CustomerName;
        reservation.DateFrom = updateDto.DateFrom;
        reservation.DateTo = updateDto.DateTo;

        await _context.SaveChangesAsync();
        return Ok(reservation);
    }

    // DELETE: api/Reservations/{id}
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return NotFound();

        _context.Reservations.Remove(reservation);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
