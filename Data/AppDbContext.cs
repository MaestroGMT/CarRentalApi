using Microsoft.EntityFrameworkCore;
using CarRentalApi.Models;

namespace CarRentalApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<CarClass> CarClasses => Set<CarClass>();
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<User> Users { get; set; }

}
