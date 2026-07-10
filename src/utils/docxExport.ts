import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

interface VehicleConfig {
  id: string;
  name: string;
  desc?: string;
  l: number;
  r: number;
  t: number;
  materials?: string;
  unit?: string;
}

interface PointData {
  id: string;
  name: string;
  targetDefenseData: {
    targetType: string;
    length: string;
    width: string;
    diameter: string;
    area: string;
    coverageMultiplier: string;
  };
  smokeMethodData: {
    lineType: "Thẳng" | "Vòng" | "Diện";
    lineRole?: "Chính" | "Dự bị";
    bufferColor?: string;
  };
  selectedVehicles: string[];
  vehicleConfigs: Record<string, VehicleConfig>;
  weatherData: {
    combatTime: string;
    windDirection: string;
    windAngle: number;
    secondaryWindDirection: string | null;
    secondaryWindAngle: number | null;
    beta: number | "";
    alpha: number | "";
    speed: number | "";
    humidity: number | string;
    rainfall: number | string;
  };
  smokeTime: {
    fromH: string;
    fromM: string;
    toH: string;
    toM: string;
    duration: string;
    mode: "range" | "duration";
  };
  battlefieldData: {
    firePoints: { distance: string; direction: string };
    commandPost: { distance: string; direction: string };
    reserveUnit: { distance: string; direction: string };
  };
  results: {
    straightLine_routes: number;
    straightLine_vehicles: number;
    circularLine_routes: number;
    circularLine_vehicles: number;
    pointVehicles: number;
    totalVehicles: number;
    coverTime_min: number;
  };
}

/**
 * Hàm ánh xạ dữ liệu của Trận địa (Point) sang các placeholder tương ứng trong file Word mẫu
 */
function mapPointToPlaceholders(selectedPoint: PointData, sessionName: string) {
  const {
    name,
    targetDefenseData,
    smokeMethodData,
    selectedVehicles,
    vehicleConfigs,
    weatherData,
    smokeTime,
    battlefieldData,
    results,
  } = selectedPoint;

  // 1. muc_tieu_bao_ve
  const muc_tieu_bao_ve = targetDefenseData?.targetType || "Mục tiêu";

  // 2. phuong_phap_tha_khoi
  let phuong_phap_tha_khoi = "tuyến thẳng";
  if (smokeMethodData?.lineType === "Vòng") {
    phuong_phap_tha_khoi = "tuyến vòng";
  } else if (smokeMethodData?.lineType === "Diện") {
    phuong_phap_tha_khoi = "tuyến diện";
  }

  // 3. huong_gio_chinh
  const huong_gio_chinh = weatherData?.windDirection || "Không xác định";

  // 4. huong_gio_phu
  const huong_gio_phu = weatherData?.secondaryWindDirection || "Không có";

  // 5. phuong_tien_phat_khoi
  const vehiclesArr = selectedVehicles || [];
  const phuong_tien_phat_khoi =
    vehiclesArr.length > 0
      ? vehiclesArr
          .map((vid) => (vehicleConfigs?.[vid] || {}).name || vid)
          .join(" và ")
      : "HPK-2.5";

  // 6. so_tuyen_khoi (N)
  let so_tuyen_khoi = 0;
  if (smokeMethodData?.lineType === "Vòng") {
    so_tuyen_khoi = results?.circularLine_routes || 0;
  } else {
    so_tuyen_khoi = results?.straightLine_routes || 0;
  }

  // 7. so_diem_phat_khoi = A / a (Số lượng phương tiện trên một tuyến chia cho số lượng trên một điểm)
  let so_diem_phat_khoi = 0;
  const a = results?.pointVehicles || 0;
  const A =
    smokeMethodData?.lineType === "Vòng"
      ? results?.circularLine_vehicles || 0
      : results?.straightLine_vehicles || 0;
  if (a > 0) {
    so_diem_phat_khoi = Math.ceil(A / a);
  }

  // 8. so_phuong_tien_tren_1_diem (a)
  const so_phuong_tien_tren_1_diem = results?.pointVehicles || 0;

  // 9. thoi_gian_phat_khoi
  let thoi_gian_phat_khoi = "";
  if (smokeTime) {
    let duration = 0;
    if (smokeTime.mode === "duration") {
      duration = Number(smokeTime.duration) || 0;
      thoi_gian_phat_khoi = `${duration} phút`;
    } else {
      const fromMin =
        Number(smokeTime.fromH || 0) * 60 + Number(smokeTime.fromM || 0);
      const toMin =
        Number(smokeTime.toH || 0) * 60 + Number(smokeTime.toM || 0);
      duration = Math.max(0, toMin - fromMin);
      thoi_gian_phat_khoi = `${duration} phút (từ ${smokeTime.fromH}:${smokeTime.fromM} đến ${smokeTime.toH}:${smokeTime.toM}`;
      if (weatherData?.combatTime) {
        thoi_gian_phat_khoi += ` ngày ${weatherData.combatTime}`;
      }
      thoi_gian_phat_khoi += ")";
    }
  }

  // 10. chieu_dai_tuyen_khoi (Khoảng cách giữa các tuyến khói song song, bằng chiều dài luồng l dọc gió của khí tài chính)
  let chieu_dai_tuyen_khoi = 250;
  if (vehiclesArr.length > 0) {
    const mainVehicleId = vehiclesArr[0];
    const mainVehicleConfig = vehicleConfigs?.[mainVehicleId];
    if (mainVehicleConfig && mainVehicleConfig.l) {
      chieu_dai_tuyen_khoi = Number(mainVehicleConfig.l);
    }
  }

  // 11. vi_tri_diem_hoa (Khoảng cách từ mốc điểm hỏa tới trận địa)
  const vi_tri_diem_hoa = battlefieldData?.firePoints?.distance || "0";

  // 12. vi_tri_chi_huy (Khoảng cách từ mốc chỉ huy tới trận địa)
  const vi_tri_chi_huy = battlefieldData?.commandPost?.distance || "0";

  // 13. vi_tri_du_bi (Khoảng cách từ mốc dự bị bảo đảm tới trận địa)
  const vi_tri_du_bi = battlefieldData?.reserveUnit?.distance || "0";

  return {
    ten_phuong_an: sessionName || name || "Kế hoạch chiến đấu",
    muc_tieu_bao_ve,
    phuong_phap_tha_khoi,
    huong_gio_chinh,
    huong_gio_phu,
    phuong_tien_phat_khoi,
    so_tuyen_khoi,
    so_diem_phat_khoi,
    so_phuong_tien_tren_1_diem,
    thoi_gian_phat_khoi,
    chieu_dai_tuyen_khoi,
    vi_tri_diem_hoa,
    vi_tri_chi_huy,
    vi_tri_du_bi,
  };
}

/**
 * Hàm gọi xuất thuyết minh kế hoạch chiến đấu sang file Word (.docx)
 * @param selectedPoint Đối tượng Trận địa đang chọn
 * @param sessionName Tên phương án hiện tại
 * @param toast Đối tượng Toast dùng để hiển thị thông báo
 */
export async function exportDocx(
  selectedPoint: any,
  sessionName: string,
  toast: { success: (msg: string) => void; error: (msg: string) => void }
) {
  try {
    // Thêm timestamp để tránh lỗi trình duyệt cache file cũ
    const response = await fetch(`/templates/ke_hoach_chien_dau_template.docx?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(
        `Không thể tìm thấy file Word mẫu tại '/templates/ke_hoach_chien_dau_template.docx'. Hãy chắc chắn bạn đã đặt file ở đúng vị trí.`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);

    // Tự động làm sạch các XML tags bị chia nhỏ trong các placeholders {{ ... }}
    for (const fileName in zip.files) {
      if (fileName.endsWith(".xml")) {
        const file = zip.file(fileName);
        if (file) {
          const originalText = file.asText();
          const cleanedText = originalText.replace(/\{\{(?:<[^>]+>|[^}])+?\}\}/g, (match) => {
            return match.replace(/<[^>]+>/g, "");
          });
          zip.file(fileName, cleanedText);
        }
      }
    }

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: "{{",
        end: "}}",
      },
    });

    const data = mapPointToPlaceholders(selectedPoint, sessionName);

    doc.setData(data);

    try {
      doc.render();
    } catch (err: any) {
      console.error("Lỗi khi điền dữ liệu vào file Word:", err);
      throw err;
    }

    const out = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Đặt tên file theo tên phương án hoặc tên điểm khói
    const cleanSessionName = (sessionName || selectedPoint.name || "kế_hoạch")
      .trim()
      .replace(/\s+/g, "_");
    const fileName = `Kế_hoạch_chiến_đấu_${cleanSessionName}.docx`;

    saveAs(out, fileName);
    toast.success("Xuất thuyết minh kế hoạch thành công!");
  } catch (err: any) {
    console.error("Lỗi xuất file Word:", err);
    toast.error(`Không thể xuất thuyết minh: ${err.message}`);
  }
}
