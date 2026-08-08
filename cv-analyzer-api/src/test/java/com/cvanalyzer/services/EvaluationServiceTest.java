package com.cvanalyzer.services;

import com.cvanalyzer.dtos.EvaluationResponse;
import com.cvanalyzer.entities.CvUpload;
import com.cvanalyzer.entities.Evaluation;
import com.cvanalyzer.exceptions.CvNotFoundException;
import com.cvanalyzer.exceptions.EvaluationAlreadyExistsException;
import com.cvanalyzer.exceptions.UnauthorizedAccessException;
import com.cvanalyzer.repos.CvUploadRepository;
import com.cvanalyzer.repos.EvaluationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {

    @Mock
    private EvaluationRepository evaluationRepository;

    @Mock
    private CvUploadRepository cvUploadRepository;

    private EvaluationService evaluationService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @BeforeEach
    void setUp() {
        evaluationService = new EvaluationService(
                evaluationRepository,
                cvUploadRepository,
                new ObjectMapper(),
                messagingTemplate
        );
    }

    // ❌ CV bulunamadı
    @Test
    void analyzeCv_WhenCvNotFound_ShouldThrowException() {
        when(cvUploadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CvNotFoundException.class,
                () -> evaluationService.analyzeCvAndVerifyUser(99L, 1L));
    }

    // ❌ CV başka kullanıcıya ait
    @Test
    void analyzeCv_WhenCvBelongsToAnotherUser_ShouldThrowException() {
        CvUpload cvUpload = new CvUpload();
        cvUpload.setUserId(1L);  // ← owner userId

        when(cvUploadRepository.findById(1L)).thenReturn(Optional.of(cvUpload));

        assertThrows(UnauthorizedAccessException.class,
                () -> evaluationService.analyzeCvAndVerifyUser(1L, 99L)); // ← farklı userId
    }

    // ❌ CV zaten değerlendirilmiş
    @Test
    void analyzeCv_WhenEvaluationAlreadyExists_ShouldThrowException() {
        CvUpload cvUpload = new CvUpload();
        cvUpload.setUserId(1L);

        Evaluation existing = new Evaluation();

        when(cvUploadRepository.findById(1L)).thenReturn(Optional.of(cvUpload));
        when(evaluationRepository.findByCvUpload(cvUpload)).thenReturn(Optional.of(existing));

        assertThrows(EvaluationAlreadyExistsException.class,
                () -> evaluationService.analyzeCvAndVerifyUser(1L, 1L));
    }

    // ✅ Kullanıcıya ait değerlendirmeler listelendi
    @Test
    void getByUserId_ShouldReturnEvaluations() {
        Evaluation e1 = new Evaluation();
        Evaluation e2 = new Evaluation();

        when(evaluationRepository.findByUserId(1L)).thenReturn(List.of(e1, e2));

        List<Evaluation> result = evaluationService.getByUserId(1L);

        assertEquals(2, result.size());
        verify(evaluationRepository, times(1)).findByUserId(1L);
    }

    // ✅ CV'ye ait değerlendirme bulundu
    @Test
    void getEvaluationByCvId_WhenExists_ShouldReturnEvaluation() {
        Evaluation evaluation = new Evaluation();
        evaluation.setScore(85.0);

        when(evaluationRepository.findByCvUpload_Id(1L)).thenReturn(Optional.of(evaluation));

        EvaluationResponse result = evaluationService.getEvaluationByCvId(1L, 1L);

        assertNotNull(result);
        assertEquals(85.0, result.getScore());
    }

    // ❌ CV'ye ait değerlendirme bulunamadı
    @Test
    void getEvaluationByCvId_WhenNotExists_ShouldThrowException() {
        when(evaluationRepository.findByCvUpload_Id(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> evaluationService.getEvaluationByCvId(99L, 99L));
    }

    // ✅ Değerlendirme silindi
    @Test
    void deleteEvaluation_WhenCvExists_ShouldDelete() {
        CvUpload cvUpload = new CvUpload();

        when(cvUploadRepository.findById(1L)).thenReturn(Optional.of(cvUpload));

        evaluationService.deleteEvaluation(1L, 1L);

        verify(evaluationRepository, times(1)).deleteByCvUpload(cvUpload);
    }

    // ❌ Silinecek CV bulunamadı
    @Test
    void deleteEvaluation_WhenCvNotFound_ShouldThrowException() {
        when(cvUploadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CvNotFoundException.class,
                () -> evaluationService.deleteEvaluation(99L, 99L));

        verify(evaluationRepository, never()).deleteByCvUpload(any());
    }
}