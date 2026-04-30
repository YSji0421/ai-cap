package com.adjuster.system.repository;

import com.adjuster.system.entity.Case;
import com.adjuster.system.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByCaseEntity(Case caseEntity);
}
