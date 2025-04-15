package br.com.smartvalidity.model.repository;

import br.com.smartvalidity.model.entity.Corredor;
import br.com.smartvalidity.model.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorredorRepository extends JpaRepository<Corredor, Integer>, JpaSpecificationExecutor<Corredor> {

    @Query("SELECT DISTINCT c FROM Corredor c LEFT JOIN FETCH c.categorias")
    List<Corredor> findAllWithCategorias();

    @Query("SELECT DISTINCT c FROM Corredor c " +
           "LEFT JOIN c.responsaveis r " +
           "WHERE (:nome IS NULL OR c.nome LIKE %:nome%) " +
           "AND (:responsavelId IS NULL OR r.id = :responsavelId)")
    List<Corredor> findByFiltros(@Param("nome") String nome, 
                                @Param("responsavelId") String responsavelId);

} 