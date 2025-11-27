package com.aswell.trainingsystem.trainingtemplate;

import com.aswell.trainingsystem.auth.AuthenticatedUser;
import com.aswell.trainingsystem.trainingtemplate.dto.MainItemRequest;
import com.aswell.trainingsystem.trainingtemplate.dto.PlanRequest;
import com.aswell.trainingsystem.trainingtemplate.dto.SubItemRequest;
import com.aswell.trainingsystem.trainingtemplate.dto.TodoRequest;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingMainItem;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingPlan;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingSubItem;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingTodo;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/training")
public class TrainingTemplateController {

    private final TrainingTemplateService service;

    public TrainingTemplateController(TrainingTemplateService service) {
        this.service = service;
    }

    private AuthenticatedUser principal(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u) {
            return u;
        }
        return null;
    }

    // Plans
    @GetMapping("/plans")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<TrainingPlan>> listPlans(
            @RequestParam(value = "keyword", required = false) String keyword,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.listPlans(keyword, principal(authentication)));
    }

    @PostMapping("/plans")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<TrainingPlan> createPlan(
            @Valid @RequestBody PlanRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.createPlan(request, principal(authentication)));
    }

    @PutMapping("/plans/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<TrainingPlan> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody PlanRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.updatePlan(id, request, principal(authentication)));
    }

    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlan(
            @PathVariable Long id,
            Authentication authentication
    ) {
        service.deletePlan(id, principal(authentication));
        return ResponseEntity.noContent().build();
    }

    // Main items
    @GetMapping("/plans/{planId}/main-items")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<TrainingMainItem>> listMainItems(
            @PathVariable Long planId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.listMainItems(planId, principal(authentication)));
    }

    @PostMapping("/main-items")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<TrainingMainItem> createMainItem(
            @Valid @RequestBody MainItemRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.createMainItem(request, principal(authentication)));
    }

    @PutMapping("/main-items/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<TrainingMainItem> updateMainItem(
            @PathVariable Long id,
            @Valid @RequestBody MainItemRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.updateMainItem(id, request, principal(authentication)));
    }

    @DeleteMapping("/main-items/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMainItem(
            @PathVariable Long id,
            Authentication authentication
    ) {
        service.deleteMainItem(id, principal(authentication));
        return ResponseEntity.noContent().build();
    }

    // Sub items
    @GetMapping("/main-items/{mainItemId}/sub-items")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<TrainingSubItem>> listSubItems(
            @PathVariable Long mainItemId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.listSubItems(mainItemId, principal(authentication)));
    }

    @PostMapping("/sub-items")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<TrainingSubItem> createSubItem(
            @Valid @RequestBody SubItemRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.createSubItem(request, principal(authentication)));
    }

    @PutMapping("/sub-items/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<TrainingSubItem> updateSubItem(
            @PathVariable Long id,
            @Valid @RequestBody SubItemRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.updateSubItem(id, request, principal(authentication)));
    }

    @DeleteMapping("/sub-items/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubItem(
            @PathVariable Long id,
            Authentication authentication
    ) {
        service.deleteSubItem(id, principal(authentication));
        return ResponseEntity.noContent().build();
    }

    // Todos
    @GetMapping("/sub-items/{subItemId}/todos")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<TrainingTodo>> listTodos(
            @PathVariable Long subItemId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.listTodos(subItemId, principal(authentication)));
    }

    @PostMapping("/todos")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<TrainingTodo> createTodo(
            @Valid @RequestBody TodoRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.createTodo(request, principal(authentication)));
    }

    @PutMapping("/todos/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<TrainingTodo> updateTodo(
            @PathVariable Long id,
            @Valid @RequestBody TodoRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.updateTodo(id, request, principal(authentication)));
    }

    @DeleteMapping("/todos/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTodo(
            @PathVariable Long id,
            Authentication authentication
    ) {
        service.deleteTodo(id, principal(authentication));
        return ResponseEntity.noContent().build();
    }
}
