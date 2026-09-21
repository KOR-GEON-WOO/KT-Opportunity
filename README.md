# 🚀 KT Opportunity

> **KT K-뉴딜 아카데미 프로젝트**\
> AI 기반 신규 음식점 영업 기회 발굴 및 맞춤 상품 설계 Agent

![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![LLM](https://img.shields.io/badge/LLM-Local-green) ![AI
Agent](https://img.shields.io/badge/AI-Agent-orange)

------------------------------------------------------------------------

## 📌 Project Overview

KT Opportunity는 신규 음식점 데이터를 기반으로 영업 기회를 탐색하고,
매장 분석, KT 상품 추천, 맞춤 상담안 생성, 후속 상담 관리까지 지원하는
AI Sales Agent 프로젝트입니다.

KT K-뉴딜 아카데미 과정에서 AI Agent 기반 업무 자동화, LLM Workflow
설계, 서비스 아키텍처 구현을 목표로 개발되었습니다.

------------------------------------------------------------------------

## 🎯 Technology Contribution

  영역                         기술                                  비중
  ---------------------------- ----------------------------------- ------
  Frontend Engineering         React 19 / Vite / UI Architecture      30%
  AI Agent System              LLM Workflow / Agent Logic             25%
  Backend Integration          FastAPI / Gateway Architecture         15%
  Automation Workflow          n8n Workflow Design                    15%
  Data Contract & Validation   API Contract / Testing                 10%
  DevOps                       Linux / Git / CUDA                      5%

------------------------------------------------------------------------

## 🏗 Architecture

    User
     |
    React Frontend
     |
    KT Opportunity Agent
     |
    HTTPS Gateway
     |
    +----------------+
    |                |
    FastAPI          n8n
     |
    +----------------+
    |                |
    vLLM          llama.cpp
     |
    HyperCLOVA X   KT Mi:dm

------------------------------------------------------------------------

## 🤖 Local LLM Environment

  Model                Runtime
  -------------------- ---------------------------
  NAVER HyperCLOVA X   vLLM
  KT Mi:dm             llama.cpp
  GPU                  NVIDIA RTX 5070 Ti Laptop
  VRAM                 12GB

------------------------------------------------------------------------

## 🛠 Tech Stack

-   React 19
-   Vite 7
-   FastAPI
-   vLLM
-   llama.cpp
-   n8n
-   Linux
-   Git / GitHub
-   CUDA Environment

------------------------------------------------------------------------

## 📂 Features

-   F-01 Restaurant Discovery
-   F-02 Store Analysis
-   F-03 Product Recommendation
-   F-04 Proposal Generation
-   F-05 Follow-up Management

------------------------------------------------------------------------

## 📈 Version History

    V0.1 ~ V0.4  KT Sales Agent
    V1 ~ V1.2     KT Opportunity Project Pivot
    V2 ~ V2.4     Architecture / Reliability / Contract Hardening
    V2.5 Foundation
                  Current Development Stage

------------------------------------------------------------------------

## ✅ Validation

``` bash
npm test
npm run build
```

Current:

    KT Opportunity V2.4 FINAL
    ✓ Smoke Test PASS
    ✓ Build PASS

------------------------------------------------------------------------

## 👨‍💻 Project

KT K-뉴딜 아카데미 프로젝트

AI Agent · LLM Infrastructure · Workflow Automation · Frontend
Engineering
