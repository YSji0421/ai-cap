-- 테스트 계정 (비밀번호: adjuster123)
INSERT INTO users (email, password, name, phone, role, login_fail_count, locked)
VALUES ('adjuster@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '김사정', '010-1234-5678', 'ADJUSTER', 0, false);

-- 사건 3건
INSERT INTO cases (user_id, case_number, case_name, accident_type, status, received_date)
VALUES
  (1, 'CASE-20250110-001', '박지훈 교통사고건', 'TRAFFIC', 'IN_PROGRESS', '2025-01-10'),
  (1, 'CASE-20250112-002', '이수연 상해보험 청구건', 'INJURY', 'RECEIVED', '2025-01-12'),
  (1, 'CASE-20250115-003', '최민준 화재 피해건', 'FIRE', 'COMPLETED', '2025-01-15');

-- 고객 3명
INSERT INTO clients (case_id, client_name, phone, insurer_name, policy_number, accident_date, injury_content)
VALUES
  (1, '박지훈', '010-9876-5432', 'DB손해보험', 'DB-2024-00123', '2025-01-08', '경추 염좌, 요추 염좌'),
  (2, '이수연', '010-5555-7777', '삼성화재', 'SH-2023-98765', '2025-01-11', '우측 발목 골절'),
  (3, '최민준', '010-3333-4444', '현대해상', 'HH-2022-55432', '2025-01-14', '주방 화재로 인한 재산 피해');

-- 상담 기록
INSERT INTO consultations (case_id, consult_seq, consult_datetime, consult_method, content, summary_content, keywords, summary_generated)
VALUES
  (1, 1, '2025-01-10 14:00:00', 'PHONE',
   '고객 박지훈씨가 전화로 1월 8일 교통사고 상황을 설명함. 신호 대기 중 후방 추돌 사고 발생. 현재 정형외과 치료 중이며 경추 및 요추 통증 호소. 보험사에서 합의 요청 연락이 왔다고 함. 치료 기간 및 합의금 관련 검토 의뢰.',
   '신호 대기 중 후방 추돌 사고 발생. 경추·요추 염좌 진단으로 치료 중. 보험사 조기 합의 요청에 대한 검토 의뢰.',
   '후유장해,치료비,합의금,과실비율,대인배상', true),
  (3, 1, '2025-01-15 10:00:00', 'IN_PERSON',
   '주방에서 가스 누출로 인한 화재 발생. 건물 일부 및 가재도구 손해. 화재보험 청구 관련 상담. 보험사 현장 조사 예정.',
   '가스 누출 화재로 건물 및 가재도구 손해 발생. 화재보험 청구 및 현장 조사 진행 예정.',
   '재물손해,화재보험,가재도구,건물손해,화재원인조사', true);

-- 보고서 (완료 사건)
INSERT INTO reports (case_id, title, report_content, adjuster_opinion, conclusion, status)
VALUES (3, '최민준 화재 피해건 손해사정 보고서',
  '[손해사정 보고서]\n작성일: 2025-01-20\n사건번호: CASE-20250115-003\n\n1. 사건 개요\n사건명: 최민준 화재 피해건\n사고유형: 화재\n\n2. 피보험자 정보\n성명: 최민준\n연락처: 010-3333-4444\n\n3. 상담 요약\n가스 누출 화재로 건물 및 가재도구 손해 발생.\n\n4. 보장 검토 핵심 항목\n재물손해, 화재보험, 가재도구, 건물손해',
  '화재 원인 및 손해액을 검토한 결과 보험 약관 상 보장 범위 내에 해당함.',
  '보험금 청구 금액은 적정 수준으로 판단되며 지급 권고함.',
  'FINAL');

-- 이력
INSERT INTO case_histories (case_id, action_type, description)
VALUES
  (1, 'CASE_CREATED', '사건 등록: 박지훈 교통사고건'),
  (1, 'CLIENT_UPDATED', '고객 정보 입력: 박지훈'),
  (1, 'CONSULTATION_ADDED', '1회 전화 상담 기록 저장'),
  (1, 'SUMMARY_GENERATED', '1회 상담 AI 요약 완료'),
  (1, 'KEYWORDS_EXTRACTED', '키워드 추출: 후유장해, 치료비, 합의금'),
  (1, 'STATUS_CHANGED', '접수 → 진행중'),
  (3, 'CASE_CREATED', '사건 등록: 최민준 화재 피해건'),
  (3, 'CLIENT_UPDATED', '고객 정보 입력: 최민준'),
  (3, 'CONSULTATION_ADDED', '1회 대면 상담 기록 저장'),
  (3, 'SUMMARY_GENERATED', '1회 상담 AI 요약 완료'),
  (3, 'REPORT_CREATED', '보고서 초안 생성'),
  (3, 'REPORT_FINALIZED', '보고서 최종 완료 처리'),
  (3, 'STATUS_CHANGED', '진행중 → 완료');
