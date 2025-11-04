using WebApplication1.DTOs.ActorDTO;

namespace WebApplication1.Services.Interfaces
{
    public interface IActorService
    {
        Task<IEnumerable<ActorDTO>> GetAllAsync();
        Task<ActorDTO> GetByIdAsync(int id);
        Task<ActorDTO> CreateAsync(ActorCreateUpdateDTO dto);
        Task<bool> UpdateAsync(int id, ActorCreateUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}

