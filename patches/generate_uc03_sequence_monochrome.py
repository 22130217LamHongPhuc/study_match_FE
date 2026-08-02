from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, ElementTree, indent


OUTPUT = Path(r"D:\Study_FE\frontend_studymatch\UC-03_Dang-ky_Sequence_Monochrome.drawio")


def add_vertex(root, cid, value, style, x, y, w, h):
    cell = SubElement(root, "mxCell", {
        "id": cid,
        "value": value,
        "style": style,
        "vertex": "1",
        "parent": "1",
    })
    SubElement(cell, "mxGeometry", {
        "x": str(x), "y": str(y), "width": str(w), "height": str(h), "as": "geometry"
    })


def add_edge(root, cid, value, style, x1, y1, x2, y2, points=None):
    cell = SubElement(root, "mxCell", {
        "id": cid,
        "value": value,
        "style": style,
        "edge": "1",
        "parent": "1",
    })
    geo = SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})
    SubElement(geo, "mxPoint", {"x": str(x1), "y": str(y1), "as": "sourcePoint"})
    SubElement(geo, "mxPoint", {"x": str(x2), "y": str(y2), "as": "targetPoint"})
    if points:
        arr = SubElement(geo, "Array", {"as": "points"})
        for px, py in points:
            SubElement(arr, "mxPoint", {"x": str(px), "y": str(py)})


def participant(root, key, label, x, top_y=95, bottom_y=2030):
    box_style = (
        "rounded=1;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;"
        "fontStyle=1;fontSize=13;fillColor=#FFFFFF;strokeColor=#111111;"
        "strokeWidth=1.2;fontColor=#111111;arcSize=10;"
    )
    if key == "student":
        actor_style = (
            "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;"
            "outlineConnect=0;fontStyle=1;fontSize=13;fontColor=#111111;"
        )
        add_vertex(root, f"{key}_top", label, actor_style, x - 25, 90, 50, 75)
        add_vertex(root, f"{key}_bottom", label, actor_style, x - 25, bottom_y, 50, 75)
    else:
        add_vertex(root, f"{key}_top", label, box_style, x - 90, top_y, 180, 55)
        add_vertex(root, f"{key}_bottom", label, box_style, x - 90, bottom_y, 180, 55)
    add_edge(
        root, f"{key}_life", "", "endArrow=none;dashed=1;dashPattern=6 6;html=1;strokeColor=#666666;strokeWidth=1;",
        x, 165, x, bottom_y
    )


def message(root, cid, value, x1, x2, y, dashed=False):
    style = (
        "html=1;endArrow=block;endFill=1;strokeWidth=1;strokeColor=#111111;fontColor=#111111;"
        "verticalAlign=bottom;"
    )
    if dashed:
        style += "dashed=1;dashPattern=6 4;"
    add_edge(root, cid, value, style, x1, y, x2, y)


def self_message(root, cid, value, x, y, dashed=False):
    style = (
        "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
        "endArrow=block;endFill=1;strokeWidth=1;strokeColor=#111111;fontColor=#111111;"
        "verticalAlign=bottom;exitX=0.5;exitY=0.5;entryX=0.5;entryY=0.5;"
    )
    if dashed:
        style += "dashed=1;dashPattern=6 4;"
    add_edge(root, cid, value, style, x, y, x + 75, y + 32, points=[(x + 75, y)])


def fragment(root, cid, y, h, title, condition):
    add_vertex(root, cid, "", "rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#111111;strokeWidth=1.5;", 45, y, 1370, h)
    add_vertex(root, cid + "_tag", f"<b>{title}</b>", "rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#111111;fontColor=#111111;align=center;fontSize=12;", 45, y, 65, 25)
    add_vertex(root, cid + "_cond", f"[{condition}]", "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;fontStyle=2;fontSize=12;fontColor=#333333;", 120, y, 520, 25)


mxfile = Element("mxfile", {"host": "app.diagrams.net", "agent": "Codex", "version": "24.7.17", "type": "device"})
diagram = SubElement(mxfile, "diagram", {"id": "uc03-register-sequence-mono", "name": "UC-03 Đăng ký"})
model = SubElement(diagram, "mxGraphModel", {
    "dx": "1420", "dy": "900", "grid": "1", "gridSize": "10", "guides": "1",
    "tooltips": "1", "connect": "1", "arrows": "1", "fold": "1", "page": "1",
    "pageScale": "1", "pageWidth": "1600", "pageHeight": "2200", "math": "0", "shadow": "0"
})
root = SubElement(model, "root")
SubElement(root, "mxCell", {"id": "0"})
SubElement(root, "mxCell", {"id": "1", "parent": "0"})

add_vertex(root, "title", "UC-03 - SEQUENCE DIAGRAM ĐĂNG KÝ TÀI KHOẢN", "text;html=1;strokeColor=none;fillColor=none;align=center;fontStyle=1;fontSize=20;fontColor=#111111;", 350, 15, 760, 35)
add_vertex(root, "subtitle", "Luồng nghiệp vụ được đánh số đồng bộ với đặc tả use case", "text;html=1;strokeColor=none;fillColor=none;align=center;fontSize=11;fontColor=#666666;", 440, 50, 580, 25)

participant(root, "student", "Sinh viên", 65)
participant(root, "ui", "Frontend\n(RegisterForm)", 250)
participant(root, "auth", "AuthController\n@PostMapping(register)", 475)
participant(root, "userrepo", "UserRepository", 700)
participant(root, "verifyservice", "EmailVerification\nTokenService", 925)
participant(root, "tokenrepo", "EmailVerification\nTokenRepository", 1150)
participant(root, "mail", "MailService", 1370)

message(root, "m310", "<b>3.1.0.</b> Sinh viên nhập thông tin và nhấn <b>Tạo tài khoản</b>", 65, 250, 195)
self_message(root, "m311", "<b>3.1.1.</b> validateFullName() / validatePassword() / validateConfirmPassword()", 250, 235)
fragment(root, "alt32", 285, 155, "alt", "Dữ liệu không hợp lệ")
self_message(root, "m322", "<b>3.2.2.</b> setErrorFullName() / setErrorPassword() / setErrorConfirmPassword()", 250, 320)
self_message(root, "m323", "<b>3.2.3.</b> Hiển thị lỗi nhập liệu", 250, 370)
add_vertex(root, "n324", "<b>3.2.4.</b> Quay lại bước <b>3.1.0</b>", "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#FFFFFF;strokeColor=#111111;fontColor=#111111;fontSize=11;", 145, 390, 220, 38)

message(root, "m312", "<b>3.1.2.</b> POST /api/auth/register", 250, 475, 475)
message(root, "m313", "<b>3.1.3.</b> existsByEmail(email)", 475, 700, 525)
fragment(root, "alt33", 565, 150, "alt", "Email đã tồn tại")
message(root, "m334", "<b>3.3.4.</b> AppException(EMAIL_ALREADY_IN_USE)", 700, 475, 600, True)
message(root, "m335", "<b>3.3.5.</b> ApiResponse(success=false)", 475, 250, 650, True)
self_message(root, "m336", "<b>3.3.6.</b> toast.error(message)", 250, 690, True)
add_vertex(root, "n336", "<b>3.3.7.</b> Quay lại bước <b>3.1.0</b>", "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#FFFFFF;strokeColor=#111111;fontColor=#111111;fontSize=11;", 145, 665, 220, 38)

self_message(root, "m314", "<b>3.1.4.</b> Mã hóa mật khẩu và tạo tài khoản", 475, 755)
message(root, "m315", "<b>3.1.5.</b> save(user)", 475, 700, 805)
fragment(root, "alt34", 845, 145, "alt", "Không thể tạo tài khoản")
message(root, "m346", "<b>3.4.6.</b> ApiResponse(success=false)", 700, 475, 880, True)
self_message(root, "m347", "<b>3.4.7.</b> toast.error(message)", 250, 930, True)

message(root, "m316", "<b>3.1.6.</b> Tạo mã xác thực email", 475, 925, 1030)
message(root, "m317", "<b>3.1.7.</b> Lưu mã xác thực", 925, 1150, 1080)
message(root, "m318", "<b>3.1.8.</b> Gửi email xác thực", 475, 1370, 1130)
message(root, "m319", "<b>3.1.9.</b> ApiResponse(success=true)", 475, 250, 1180, True)
self_message(root, "m3110", "<b>3.1.10.</b> toast.success() / navigate(/login)", 250, 1230, True)
message(root, "m3111", "<b>3.1.11.</b> Sinh viên nhấn liên kết xác thực trong email", 65, 475, 1290)
message(root, "m3112", "<b>3.1.12.</b> GET /api/verify-email/confirm?token={token}", 65, 475, 1340)
message(root, "m3113", "<b>3.1.13.</b> verifyEmail(token)", 475, 925, 1390)
message(root, "m3114", "<b>3.1.14.</b> findByToken(token)", 925, 1150, 1440)

fragment(root, "alt35", 1480, 160, "alt", "Mã không tồn tại / đã dùng / hết hạn")
message(root, "m3515", "<b>3.5.15.</b> AppException(INVALID_TOKEN / TOKEN_USED / TOKEN_EXPIRED)", 1150, 925, 1515, True)
self_message(root, "m3516", "<b>3.5.16.</b> Thông báo xác thực không thành công", 250, 1570, True)
add_vertex(root, "n3517", "<b>3.5.17.</b> Yêu cầu gửi lại email xác thực", "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#FFFFFF;strokeColor=#111111;fontColor=#111111;fontSize=11;", 110, 1590, 245, 38)

message(root, "m3115", "<b>3.1.15.</b> findById(userId)", 925, 700, 1680)
self_message(root, "m3116", "<b>3.1.16.</b> Cập nhật trạng thái xác thực", 925, 1730)
message(root, "m3117", "<b>3.1.17.</b> save(user)", 925, 700, 1790)
message(root, "m3118", "<b>3.1.18.</b> save(verificationToken)", 925, 1150, 1840)
message(root, "m3119", "<b>3.1.19.</b> HTML 'Xác thực email thành công'", 475, 65, 1900, True)

add_vertex(root, "legend", "<b>Quy ước:</b> Mũi tên liền: lời gọi  |  Mũi tên đứt: phản hồi  |  Khung alt: luồng ngoại lệ", "rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#111111;fontColor=#111111;fontSize=11;align=center;", 390, 2120, 760, 38)

indent(mxfile, space="  ")
ElementTree(mxfile).write(OUTPUT, encoding="utf-8", xml_declaration=True)
print(OUTPUT)
