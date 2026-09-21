# 🏗 System Architecture

KT Opportunity는 React 기반 Frontend와 n8n Workflow, Local LLM Gateway,
LLM Runtime을 연결한 AI Agent 기반 영업 지원 플랫폼입니다.

![KT Opportunity Architecture](./docs/images/architecture.png)

------------------------------------------------------------------------

## Architecture Flow

    User
     ↓
    React / Vite Frontend
     ↓
    n8n Workflow Controller
     ↓
    Restaurant Discovery API
     ↓
    Store Analysis & Product Recommendation
     ↓
    Local LLM Gateway
     ↓
    vLLM / llama.cpp
     ↓
    Proposal Generation
     ↓
    Follow-up Management

------------------------------------------------------------------------

## AI Runtime Architecture

  Component         Technology      Purpose
  ----------------- --------------- ------------------------------
  Frontend          React + Vite    영업 담당자 Workspace
  Workflow          n8n             Agent Workflow Orchestration
  Backend           FastAPI         LLM Gateway / API Boundary
  Reasoning Model   HyperCLOVA X    조건 분석 및 상담 전략
  Response Model    KT Mi:dm        상담 문구 및 응답 생성
  Storage           Google Sheets   상담 이력 관리

------------------------------------------------------------------------

# 💡 Engineering Highlights

## 🤖 AI Agent Workflow

-   음식점 후보 탐색
-   매장 상태 검증
-   KT 상품 조건 분석
-   맞춤 상담안 생성

## 🧠 Local LLM Infrastructure

-   HyperCLOVA X (vLLM)
-   KT Mi:dm (llama.cpp)
-   FastAPI Gateway Boundary
-   GPU Resource Management

## ⚙️ Workflow Automation

-   n8n 기반 Agent Pipeline
-   F-01 \~ F-05 단계별 검증
-   상담 승인 Gate
-   History Management
