import { categoryLabels } from "../data/mockData.js";

const STATUS_FIELD = {
  INTERNET: "internetStatus",
  WIFI: "wifiStatus",
  POS: "posStatus",
  CCTV: "cctvStatus",
};

export function analyzeProductNeeds(verification) {
  const recommend = [];
  const exclude = [];
  const confirm = [];

  const categories = Object.keys(STATUS_FIELD);

  if (verification.actualOpenStatus === "CLOSED") {
    categories.forEach((category) =>
      exclude.push({ category, reason: "실제 개업 상태가 CLOSED입니다." })
    );
    return { recommend, exclude, confirm, eligible: false, openGate: "CLOSED" };
  }

  if (verification.actualOpenStatus === "UNKNOWN") {
    categories.forEach((category) =>
      confirm.push({ category, reason: "실제 개업 여부를 먼저 확인해야 합니다." })
    );
    return { recommend, exclude, confirm, eligible: false, openGate: "UNKNOWN" };
  }

  categories.forEach((category) => {
    const status = verification[STATUS_FIELD[category]] ?? "UNKNOWN";

    if (status === "CONTRACTED") {
      exclude.push({ category, reason: "이미 계약된 상품군입니다." });
      return;
    }

    if (status === "NOT_REQUIRED") {
      exclude.push({ category, reason: "직원이 불필요로 확인한 상품군입니다." });
      return;
    }

    if (status === "UNKNOWN") {
      confirm.push({ category, reason: "계약 상태 추가 확인이 필요합니다." });
      return;
    }

    if (status === "UNDECIDED") {
      if (category === "INTERNET") {
        if (verification.installStatus === "PASS") {
          recommend.push({ category, reason: "인터넷 미정 + KT 설치 가능(PASS) 조건 충족" });
        } else if (verification.installStatus === "FAIL") {
          exclude.push({ category, reason: "KT 인터넷 설치 불가(FAIL)" });
        } else {
          confirm.push({ category, reason: "KT 인터넷 설치 가능 여부 확인이 필요합니다." });
        }
        return;
      }

      recommend.push({ category, reason: `${categoryLabels[category]} 계약 상태가 미정입니다.` });
    }
  });

  return {
    recommend,
    exclude,
    confirm,
    eligible: verification.actualOpenStatus === "OPEN" || verification.actualOpenStatus === "PREPARING",
    openGate: verification.actualOpenStatus,
  };
}
