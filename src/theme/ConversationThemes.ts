export interface ConversationTheme {
    id: string;
    name: string;
    gradient: string; // Used for icon preview and own message bubble
    background?: string; // Optional background color for chat
}

export const CONVERSATION_THEMES: ConversationTheme[] = [
    {
        id: "default",
        name: "Mặc định",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", // Default blue
        background: "#ffffff",
    },
    {
        id: "candy",
        name: "Kẹo ngọt",
        gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    },
    {
        id: "unicorn",
        name: "Kỳ lân",
        gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    },
    {
        id: "maple",
        name: "Màu lá phong",
        gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    },
    {
        id: "sushi",
        name: "Sushi",
        gradient: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)",
    },
    {
        id: "rocket",
        name: "Tên lửa",
        gradient: "linear-gradient(135deg, #f83600 0%, #f9d423 100%)",
    },
    {
        id: "lollipop",
        name: "Kẹo mút",
        gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
    },
    {
        id: "shadow",
        name: "Bóng râm",
        gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    },
    {
        id: "rose",
        name: "Hoa hồng",
        gradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
    },
    {
        id: "ocean",
        name: "Đại dương",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
        id: "forest",
        name: "Rừng xanh",
        gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    }
];

export const getThemeById = (id: string | null | undefined): ConversationTheme => {
    if (!id) return CONVERSATION_THEMES[0];
    return CONVERSATION_THEMES.find(t => t.id === id) || CONVERSATION_THEMES[0];
};
