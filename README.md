# 📦 Version  
**v1.5.1**  

---

# 📜 Changelog  
- **v1.5.0 (2025-09-17):** Thêm checkbox **Post Now**  
  > 📌 Chi tiết xem tại phần *Post Scheduling Feature* bên dưới.  
- **v1.5.1 (2025-09-25):** Chặn index các công cụ tìm kiếm
  > 📌 Chi tiết xem tại phần *Post Scheduling Feature* bên dưới.  
---

# 📌 Post Scheduling Feature *(bổ sung cho v1.5.0)*  

## ✅ Tính năng  

- **Post Now**  
  - Nếu checkbox **Post Now** được chọn → bài viết sẽ được đăng ngay.  

- **Schedule Post bằng Unix Timestamp**  
  - Nếu nhập **Unix timestamp** → bài viết sẽ được lên lịch đăng.  
  - Nếu để trống → mặc định đăng ngay.  

---

## ⏱️ Unix Timestamp  

- Là số giây tính từ `00:00:00 UTC 01/01/1970`.  
- Dùng để định nghĩa thời gian cho API.  
- Tra cứu nhanh: [https://www.unixtimestamp.com/](https://www.unixtimestamp.com/)  

Ví dụ:  

| Thời gian (UTC+7)   | Unix Timestamp |
|----------------------|----------------|
| 2025-09-17 10:00:00 | `1758080400`   |
| 2025-09-18 20:30:00 | `1758198600`   |  
