using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repositories.Interfaces;

namespace WebApplication1.Repositories
{
    public class ActorRepository : IActorRepository
    {
        private readonly CINE_2025_1W1_GRUPO_5Context _context;

        public ActorRepository(CINE_2025_1W1_GRUPO_5Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Actor>> GetAllAsync()
        {
            return await _context.Actores
                .Include(a => a.IdPaisNavigation)
                .ToListAsync();
        }

        public async Task<Actor> GetByIdAsync(int id)
        {
            return await _context.Actores
                .Include(a => a.IdPaisNavigation)
                .FirstOrDefaultAsync(a => a.IdActor == id);
        }

        public async Task<Actor> AddAsync(Actor actor)
        {
            _context.Actores.Add(actor);
            await _context.SaveChangesAsync();
            return actor;
        }

        public async Task UpdateAsync(Actor actor)
        {
            _context.Entry(actor).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Actores.FindAsync(id);
            if (entity != null)
            {
                _context.Actores.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Actores.AnyAsync(e => e.IdActor == id);
        }
    }
}

