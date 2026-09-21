# 🚀 KT K-뉴딜 아카데미 프로젝트

# KT Opportunity

> AI Agent 기반 신규 음식점 영업 기회 발굴 및 맞춤 상품 설계 플랫폼

KT Opportunity는 KT K-뉴딜 아카데미 프로젝트로 개발한 AI Agent 기반 영업
지원 플랫폼입니다.

음식점 데이터를 기반으로 영업 기회를 탐색하고, 매장 상태 분석, KT 상품
추천, 맞춤 상담안 생성, 후속 상담 관리까지 연결하는 Workflow Automation
시스템입니다.

------------------------------------------------------------------------

# 📌 Project Overview

  항목                  내용
  --------------------- --------------------------------------
  Project               KT Opportunity
  Program               KT K-뉴딜 아카데미
  Type                  AI Agent / Sales Automation Platform
  Version               V2.5 Foundation
  Frontend              React + Vite
  Workflow Automation   n8n
  API Gateway           FastAPI
  AI Runtime            vLLM / llama.cpp

------------------------------------------------------------------------

# 🏗 System Architecture

![KT Opportunity Architecture](./docs/images/architecture.png)

## Architecture Flow

    User
     ↓
    React + Vite Frontend
     ↓
    n8n Agent Workflow
     ↓
    Restaurant Discovery & Analysis
     ↓
    KT Product Recommendation Engine
     ↓
    FastAPI LLM Gateway
     ↓
    Local LLM Runtime
     ↓
    Proposal Generation
     ↓
    Follow-up Management

------------------------------------------------------------------------

# 🤖 AI Agent Workflow

## Business Flow

    F-01 Restaurant Discovery
            ↓
    F-02 Store Verification
            ↓
    F-03 Opportunity Analysis
            ↓
    F-04 Customized Proposal
            ↓
    F-05 Follow-up Management

주요 기능:

-   신규 음식점 영업 후보 발굴
-   매장 상태 검증
-   KT 상품 조건 분석
-   AI 기반 맞춤 상담안 생성
-   상담 이력 관리
-   Idempotency 기반 중복 저장 방지

------------------------------------------------------------------------

# 🧠 LLM Infrastructure

## Local LLM Model Stack

  ---------------------------------------------------------------------------
  제조사            모델                  추론 엔진         활용 목적
  ----------------- --------------------- ----------------- -----------------
  NAVER Cloud       HyperCLOVA X SEED     vLLM              Agent Reasoning /
                    Think 14B                               분석

  KT                Mi:dm 2.0             llama.cpp         한국어 상담 응답
                    Base-Instruct 11.5B                     생성

  Alibaba Cloud     Qwen3.5-9B            llama.cpp         범용 한국어/영어
                                                            LLM 테스트

  Microsoft         Phi-4-mini-instruct   llama.cpp         경량 추론 테스트
                    3.8B                                    

  Google            Gemma 4 12B IT        llama.cpp         한국어·범용 LLM
                                                            비교
  ---------------------------------------------------------------------------

## Runtime Architecture

    HyperCLOVA X SEED Think 14B
    (NAVER Cloud)
            |
            | vLLM
            |
    FastAPI Gateway
            |
            |
    KT Mi:dm 2.0 Base-Instruct 11.5B
    (KT)
            |
            | llama.cpp

운영 원칙:

-   NVIDIA RTX 5070 Ti Laptop GPU 환경 최적화
-   12GB VRAM 기준 Local LLM 운영
-   GPU에는 한 시점에 하나의 모델만 실행
-   Browser에서 LLM Endpoint 직접 호출 금지
-   FastAPI Gateway Boundary 적용

------------------------------------------------------------------------

# ⚙️ Technology Stack

## Frontend

  Technology   Usage
  ------------ --------------
  React 19     UI Framework
  Vite 7       Build Tool

## Backend / Automation

  Technology   Usage
  ------------ ---------------------
  FastAPI      LLM Gateway
  n8n          Workflow Automation
  Docker       Runtime Environment

## AI Framework

  Technology     Usage
  -------------- ------------------------------
  vLLM           High Performance LLM Serving
  llama.cpp      Local LLM Runtime
  Hugging Face   Model Management

------------------------------------------------------------------------

# 📊 Engineering Highlights

## AI Agent Design

-   Workflow 기반 Agent 구조
-   F-01 \~ F-05 단계별 검증
-   Business Rule Validation

## Data Reliability

-   API Contract 관리
-   Product Catalog Validation
-   Consultation History Contract
-   Idempotency 처리

## Frontend Engineering

-   Responsive UI
-   Accessibility 고려
-   Workflow State Management
-   Operational Error Recovery

------------------------------------------------------------------------

# 📈 Project Evolution

    KT Sales Agent

    V0.1 Functional MVP
            ↓
    V0.4 Reliability & Persistence
            ↓
    V1 KT Opportunity Project Pivot
            ↓
    V2 Product Architecture Rewrite
            ↓
    V2.4 FINAL Release Baseline
            ↓
    V2.5 Foundation

------------------------------------------------------------------------

# 🧪 Validation

``` bash
npm test
npm run build
```

검증 항목:

-   Workflow Rule Check
-   API Contract Validation
-   Proposal Catalog Validation
-   Save Approval Gate
-   Idempotency Test
-   Production Build Verification

------------------------------------------------------------------------

# 📂 Repository Structure

    KT-Opportunity
    │
    ├── src
    ├── scripts
    ├── deploy
    │
    ├── docs
    │   ├── ARCHITECTURE.md
    │   ├── VERSION_LINEAGE.md
    │   ├── CHANGELOG.md
    │   └── images
    │       └── architecture.png
    │
    ├── package.json
    └── README.md

------------------------------------------------------------------------

# 📌 Current Version

KT Opportunity V2.5 Foundation

Based on:

KT Opportunity V2.4 FINAL Release Baseline
