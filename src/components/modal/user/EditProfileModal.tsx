import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Modal,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { UserProfile } from '../../../model/UserModel';
import { updateUserProfileService } from '../../../services/FriendService';
import { uploadPostMedia } from '../../../services/SocialPostService';
import { toast } from 'react-toastify';

type EditProfileModalProps = {
    stateModal: boolean;
    setModalEdit: React.Dispatch<React.SetStateAction<boolean>>;
    profile?: UserProfile;
    onProfileUpdated?: (profile: UserProfile) => void;
};

export default function EditProfileModal({
    stateModal,
    setModalEdit,
    profile,
    onProfileUpdated,
}: EditProfileModalProps) {
    const avatarUrl = profile?.avatarUrl ?? '';
    const bannerUrl = profile?.bannerUrl ?? '';

    const [fullName, setFullName] = useState(profile?.fullName ?? '');
    const [bio, setBio] = useState(profile?.bio ?? '');

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string>('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (stateModal) {
            setFullName(profile?.fullName ?? '');
            setBio(profile?.bio ?? '');
            setAvatarPreview(profile?.avatarUrl ?? '');
            setBannerPreview(profile?.bannerUrl ?? '');
            setAvatarFile(null);
            setBannerFile(null);
        }
    }, [stateModal, profile]);

    const handleClose = () => {
        if (saving) return;
        setModalEdit(false);
    };

    const handleSelectAvatar = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.warning('Chỉ chọn ảnh đại diện dạng hình ảnh');
            return;
        }
        if (avatarPreview && !avatarPreview.startsWith('http')) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSelectBanner = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.warning('Chỉ chọn ảnh bìa dạng hình ảnh');
            return;
        }
        if (bannerPreview && !bannerPreview.startsWith('http')) URL.revokeObjectURL(bannerPreview);
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        const userId = Number(localStorage.getItem('userId'));
        if (!userId) {
            toast.error('Không tìm thấy userId. Vui lòng đăng nhập lại.');
            return;
        }
        if (!fullName.trim()) {
            toast.warning('Họ và tên không được để trống');
            return;
        }

        setSaving(true);
        try {
            const uploadedAvatar = avatarFile ? await uploadPostMedia(avatarFile) : null;
            const uploadedBanner = bannerFile ? await uploadPostMedia(bannerFile) : null;
            const updated = await updateUserProfileService(userId, {
                fullName: fullName.trim(),
                bio: bio.trim(),
                avatarUrl: uploadedAvatar?.mediaUrl || avatarUrl,
                bannerUrl: uploadedBanner?.mediaUrl || bannerUrl,
            });
            onProfileUpdated?.({
                ...(profile as UserProfile),
                ...updated,
                fullName: updated?.fullName ?? fullName.trim(),
                bio: updated?.bio ?? bio.trim(),
                avatarUrl: updated?.avatarUrl ?? uploadedAvatar?.mediaUrl ?? avatarUrl ?? '',
                bannerUrl: updated?.bannerUrl ?? uploadedBanner?.mediaUrl ?? bannerUrl ?? '',
            });
            setModalEdit(false);
        } catch (error) {
            console.error(error);
            toast.error('Không thể cập nhật hồ sơ');
        } finally {
            setSaving(false);
        }
    };

    const hasBanner = bannerPreview || bannerUrl;

    return (
        <Modal
            open={stateModal}
            onClose={handleClose}
            aria-labelledby="edit-profile-title"
            aria-describedby="edit-profile-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '92%', sm: 500 },
                    bgcolor: 'background.paper',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    p: 3,
                    borderRadius: '16px',
                    outline: 'none',
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Typography id="edit-profile-title" variant="h6" fontWeight="800" sx={{ color: '#0f172a' }}>
                        Chỉnh sửa thông tin
                    </Typography>
                    <IconButton size="small" onClick={handleClose} sx={{ color: '#64748b', bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Stack>

                <Stack spacing={2.5}>
                    {/* Banner and Avatar Area */}
                    <Box sx={{ position: 'relative', width: '100%', height: 120 }}>
                        {/* Banner Selector */}
                        <Button 
                            component="label" 
                            sx={{ 
                                p: 0, 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '12px', 
                                overflow: 'hidden', 
                                display: 'block',
                                position: 'relative',
                                bgcolor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                textTransform: 'none',
                            }}
                        >
                            {hasBanner ? (
                                <Box 
                                    component="img"
                                    src={bannerPreview || bannerUrl || undefined}
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <Box 
                                    sx={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        backgroundImage: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)" 
                                    }}
                                />
                            )}
                            <Box
                                className="banner-overlay"
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    bgcolor: hasBanner ? 'rgba(15, 23, 42, 0.5)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: hasBanner ? '#fff' : '#64748b',
                                    gap: 1,
                                    opacity: hasBanner ? 0 : 1,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        opacity: 1,
                                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                                        color: '#fff',
                                    }
                                }}
                            >
                                <PhotoCameraIcon sx={{ fontSize: 20 }} />
                                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Thay đổi ảnh bìa</Typography>
                            </Box>
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                    handleSelectBanner(event.target.files?.[0] || null);
                                    event.target.value = '';
                                }}
                            />
                        </Button>

                        {/* Avatar Selector */}
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                left: '50%', 
                                transform: 'translateX(-50%)', 
                                bottom: -35,
                                zIndex: 2 
                            }}
                        >
                            <Button component="label" sx={{ p: 0, borderRadius: '50%', position: 'relative', bgcolor: '#fff', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                <Avatar
                                    src={avatarPreview || avatarUrl || undefined}
                                    sx={{ width: 80, height: 80 }}
                                >
                                    {fullName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: -2,
                                        bottom: -2,
                                        width: 26,
                                        height: 26,
                                        borderRadius: '50%',
                                        bgcolor: '#3b82f6',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                                        border: '2px solid #fff',
                                        transition: 'background-color 0.2s ease',
                                        '&:hover': {
                                            bgcolor: '#2563eb'
                                        }
                                    }}
                                >
                                    <PhotoCameraIcon sx={{ fontSize: 13 }} />
                                </Box>
                                <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        handleSelectAvatar(event.target.files?.[0] || null);
                                        event.target.value = '';
                                    }}
                                />
                            </Button>
                        </Box>
                    </Box>

                    {/* Spacing to push form fields below absolute avatar */}
                    <Box sx={{ height: '24px' }} />

                    <TextField
                        label="Họ và tên"
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                "& fieldset": {
                                    borderColor: "#e2e8f0",
                                },
                                "&:hover fieldset": {
                                    borderColor: "#cbd5e1",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#3b82f6",
                                }
                            }
                        }}
                    />
                    <TextField
                        label="Bio"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                "& fieldset": {
                                    borderColor: "#e2e8f0",
                                },
                                "&:hover fieldset": {
                                    borderColor: "#cbd5e1",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#3b82f6",
                                }
                            }
                        }}
                    />
                </Stack>

                <Stack direction="row" justifyContent="flex-end" spacing={1.5} mt={3}>
                    <Button 
                        variant="outlined" 
                        onClick={handleClose} 
                        disabled={saving}
                        sx={{ 
                            borderRadius: '20px', 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            px: 3,
                            borderColor: '#cbd5e1',
                            color: '#475569',
                            '&:hover': {
                                borderColor: '#94a3b8',
                                bgcolor: '#f8fafc'
                            }
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        disabled={saving}
                        onClick={handleSave}
                        sx={{ 
                            px: 4, 
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                boxShadow: '0 6px 16px rgba(59, 130, 246, 0.3)',
                            },
                            '&.Mui-disabled': {
                                background: '#93c5fd',
                                color: '#ffffff'
                            }
                        }}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}
