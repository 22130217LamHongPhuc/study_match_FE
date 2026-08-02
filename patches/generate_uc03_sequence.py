from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, ElementTree, indent


OUTPUT = Path(r"D:\Study_FE\frontend_studymatch\UC-03_Dang-ky_Sequence_Technical.drawio")


mxfile = Element("mxfile", {
    "host": "app.diagrams.net", "agent": "Codex", "version": "24.7.17", "type": "device"
})
diagram = SubElement(mxfile, "diagram", {"id": "uc03-register-sequence", "name": "UC-03 Đăng ký"})
model = SubElement(diagram, "mxGraphModel", {
    "dx": "1420", "dy": "900", "grid": "1", "gridSize": "10", "guides": "1",
    "tooltips": "1", "connect": "1", "arrows": "1", "fold": "1", "page": "1",
    "pageScale": "1", "pageWidth": "1600", "pageHeight": "2200", "math": "0", "shadow": "0"
})
root = SubElement(model, "root")
SubElement(root, "mxCell", {"id": "0"})
SubElement(root, "mxCell", {"id": "1", "parent": "0"})


def vertex(cid, value, style, x, y, w, h):
    cell = SubElement(root, "mxCell", {
        "id": cid, "value": value, "style": style, "vertex": "1", "parent": "1"
    })
    SubElement(cell, "mxGeometry", {
        "x": str(x), "y": str(y), "width": str(w), "height": str(h), "as": "geometry"
    })
    return cell


def line(cid, x, y1, y2):
    cell = SubElement(root, "mxCell", {
        "id": cid, "style": "endArrow=none;dashed=1;dashPattern=6 6;html=1;strokeColor=#64748B;strokeWidth=1;",
        "edge": "1", "parent": "1"
    })
    geo = SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})
    SubElement(geo, "mxPoint", {"x": str(x), "y": str(y1), "as": "sourcePoint"})
    SubElement(geo, "mxPoint", {"x": str(x), "y": str(y2), "as": "targetPoint"})


def message(cid, value, x1, x2, y, dashed=False, color="#1E293B"):
    style = (
        "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
        f"endArrow=block;endFill=1;strokeWidth=1.5;strokeColor={color};fontColor=#0F172A;"
        "labelBackgroundColor=#FFFFFF;labelBorderColor=none;"
    )
    if dashed:
        style += "dashed=1;dashPattern=6 4;"
    cell = SubElement(root, "mxCell", {
        "id": cid, "value": value, "style": style, "edge": "1", "parent": "1"
    })
    geo = SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})
    SubElement(geo, "mxPoint", {"x": str(x1), "y": str(y), "as": "sourcePoint"})
    SubElement(geo, "mxPoint", {"x": str(x2), "y": str(y), "as": "targetPoint"})


def self_message(cid, value, x, y, color="#1E293B"):
    cell = SubElement(root, "mxCell", {
        "id": cid, "value": value,
        "style": (
            "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
            f"endArrow=block;endFill=1;strokeWidth=1.5;strokeColor={color};fontColor=#0F172A;"
            "labelBackgroundColor=#FFFFFF;exitX=0.5;exitY=0.5;entryX=0.5;entryY=0.5;"
        ),
        "edge": "1", "parent": "1"
    })
    geo = SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})
    SubElement(geo, "mxPoint", {"x": str(x), "y": str(y), "as": "sourcePoint"})
    SubElement(geo, "mxPoint", {"x": str(x + 75), "y": str(y + 32), "as": "targetPoint"})
    arr = SubElement(geo, "Array", {"as": "points"})
    SubElement(arr, "mxPoint", {"x": str(x + 75), "y": str(y)})


def fragment(cid, y, h, title, condition, color):
    vertex(
        cid, "", f"rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeColor={color};strokeWidth=1.5;",
        45, y, 1370, h
    )
    vertex(
        cid + "_tag", f"<b>{title}</b>",
        f"rounded=0;whiteSpace=wrap;html=1;fillColor={color};strokeColor={color};fontColor=#FFFFFF;align=center;fontSize=12;",
        45, y, 65, 25
    )
    vertex(
        cid + "_cond", f"[{condition}]",
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;fontStyle=2;fontSize=12;fontColor=#334155;",
        120, y, 520, 25
    )


header_style = (
    "rounded=1;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=13;"
    "fillColor=#E0F2FE;strokeColor=#0284C7;strokeWidth=1.5;fontColor=#0F172A;arcSize=10;"
)
title_style = "text;html=1;strokeColor=none;fillColor=none;align=center;fontStyle=1;fontSize=20;fontColor=#0F172A;"
subtitle_style = "text;html=1;strokeColor=none;fillColor=none;align=center;fontSize=11;fontColor=#64748B;"

vertex("title", "UC-03 – SEQUENCE DIAGRAM ĐĂNG KÝ TÀI KHOẢN", title_style, 350, 15, 760, 35)
vertex("subtitle", "Luồng nghiệp vụ được đánh số đồng bộ với đặc tả use case", subtitle_style, 440, 50, 580, 25)

participants = [
    ("student", "Sinh viên", 65),
    ("ui", "Frontend&#xa;(RegisterForm)", 250),
    ("auth", "AuthController&#xa;@PostMapping(register)", 475),
    ("userrepo", "UserRepository", 700),
    ("verifyservice", "EmailVerification&#xa;TokenService", 925),
    ("tokenrepo", "EmailVerification&#xa;TokenRepository", 1150),
    ("mail", "MailService", 1370),
]

for pid, name, x in participants:
    if pid == "student":
        vertex(pid + "_top", name, "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fontSize=13;", x - 25, 90, 50, 75)
        vertex(pid + "_bottom", name, "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fontSize=13;", x - 25, 2020, 50, 75)
    else:
        vertex(pid + "_top", name, header_style, x - 90, 95, 180, 55)
        vertex(pid + "_bottom", name, header_style, x - 90, 2030, 180, 55)
    line(pid + "_life", x, 165, 2030)

# Main flow and branch 3.2
message("m310", "<b>3.1.0.</b> Nhập thông tin và nhấn <b>Tạo tài khoản</b>", 65, 250, 195)
self_message("m311", "<b>3.1.1.</b> validateFullName() / validatePassword() / validateConfirmPassword()", 250, 235)

fragment("alt32", 285, 155, "alt", "Thông tin không hợp lệ", "#DC2626")
self_message("m322", "<b>3.2.2.</b> setErrorFullName() / setErrorPassword() / setErrorConfirmPassword()", 250, 320, "#DC2626")
message("m323", "<b>3.2.3.</b> Hiển thị lỗi nhập liệu", 250, 65, 370, False, "#DC2626")
vertex("n324", "<b>3.2.4.</b> Quay lại bước <b>3.1.0</b>", "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#7F1D1D;fontSize=11;", 145, 390, 220, 38)

message("m312", "<b>3.1.2.</b> POST /api/auth/register", 250, 475, 475)
message("m313", "<b>3.1.3.</b> existsByEmail(email)", 475, 700, 525)

# Duplicate email branch
fragment("alt33", 565, 150, "alt", "Email đã tồn tại", "#EA580C")
message("m334", "<b>3.3.4.</b> AppException(EMAIL_ALREADY_IN_USE)", 700, 475, 600, True, "#EA580C")
message("m335", "<b>3.3.5.</b> ApiResponse(success=false)", 475, 250, 650, True, "#EA580C")
message("m336", "<b>3.3.6.</b> toast.error(message)", 250, 65, 690, False, "#EA580C")
vertex("n336", "<b>3.3.6.</b> Quay lại bước <b>3.1.0</b>", "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#FFEDD5;strokeColor=#EA580C;fontColor=#7C2D12;fontSize=11;", 145, 665, 220, 38)

self_message("m314", "<b>3.1.4.</b> passwordEncoder.encode(password) / new User()", 475, 755)
message("m315", "<b>3.1.5.</b> save(user)", 475, 700, 805)

# Account creation failure
fragment("alt34", 845, 145, "alt", "Không thể lưu tài khoản", "#B91C1C")
message("m346", "<b>3.4.6.</b> ApiResponse(INTERNAL_SERVER_ERROR)", 700, 475, 880, True, "#B91C1C")
message("m347", "<b>3.4.7.</b> toast.error(message)", 475, 65, 930, True, "#B91C1C")

message("m316", "<b>3.1.6.</b> saveVerificationToken(user)", 475, 925, 1030)
message("m317", "<b>3.1.7.</b> save(verificationToken)", 925, 1150, 1080)
message("m318", "<b>3.1.8.</b> sendMailTo(email, verify-email, link)", 475, 1370, 1130)
message("m319", "<b>3.1.9.</b> ApiResponse(success=true)", 475, 250, 1180, True)
self_message("m3110", "<b>3.1.10.</b> navigate(/login)", 250, 1230)
message("m3111", "<b>3.1.11.</b> Nhấn liên kết xác thực trong email", 65, 475, 1290)
message("m3112", "<b>3.1.12.</b> GET /api/verify-email/confirm?token={token}", 65, 475, 1340)
message("m3113", "<b>3.1.13.</b> verifyEmail(token)", 475, 925, 1390)
message("m3114", "<b>3.1.14.</b> findByToken(token)", 925, 1150, 1440)

# Invalid verification token
fragment("alt35", 1480, 160, "alt", "Mã không tồn tại / đã dùng / hết hạn", "#7C3AED")
message("m3515", "<b>3.5.15.</b> AppException(INVALID_TOKEN / TOKEN_USED / TOKEN_EXPIRED)", 1150, 925, 1515, True, "#7C3AED")
message("m3516", "<b>3.5.16.</b> Thông báo xác thực không thành công", 925, 65, 1570, True, "#7C3AED")
vertex("n3517", "<b>3.5.17.</b> Yêu cầu gửi lại email xác thực", "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#EDE9FE;strokeColor=#7C3AED;fontColor=#4C1D95;fontSize=11;", 110, 1590, 245, 38)

message("m3115", "<b>3.1.15.</b> findById(userId)", 925, 700, 1680)
self_message("m3116", "<b>3.1.16.</b> setEmailVerified(true) / setUsed(true)", 925, 1730)
message("m3117", "<b>3.1.17.</b> save(user)", 925, 700, 1790)
message("m3118", "<b>3.1.18.</b> save(verificationToken)", 925, 1150, 1840)
message("m3119", "<b>3.1.19.</b> HTML “Xác thực email thành công”", 475, 65, 1900, True, "#15803D")

# Legend
vertex("legend", "<b>Quy ước:</b> Mũi tên liền: lời gọi &nbsp;&nbsp;|&nbsp;&nbsp; Mũi tên đứt: phản hồi &nbsp;&nbsp;|&nbsp;&nbsp; Khung alt: luồng ngoại lệ", "rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#CBD5E1;fontColor=#475569;fontSize=11;align=center;", 390, 2120, 760, 38)

indent(mxfile, space="  ")
ElementTree(mxfile).write(OUTPUT, encoding="utf-8", xml_declaration=True)
print(OUTPUT)
