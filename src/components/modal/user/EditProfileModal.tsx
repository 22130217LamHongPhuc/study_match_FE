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
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!stateModal) return;
        setFullName(profile?.fullName || '');
        setBio(profile?.bio || '');
        setAvatarUrl(profile?.avatarUrl || null);
        setAvatarFile(null);
        setAvatarPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setBannerUrl(profile?.bannerUrl || null);
        setBannerFile(null);
        setBannerPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
    }, [stateModal, profile]);

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    useEffect(() => {
        return () => {
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        };
    }, [bannerPreview]);

    const handleClose = () => {
        if (saving) return;
        setModalEdit(false);
    };

    const handleSelectAvatar = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Chỉ chọn ảnh đại diện dạng hình ảnh');
            return;
        }
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSelectBanner = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Chỉ chọn ảnh bìa dạng hình ảnh');
            return;
        }
        if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        const userId = Number(localStorage.getItem('userId'));
        if (!userId) {
            alert('Không tìm thấy userId. Vui lòng đăng nhập lại.');
            return;
        }
        if (!fullName.trim()) {
            alert('Họ và tên không được để trống');
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
            alert('Không thể cập nhật hồ sơ');
        } finally {
            setSaving(false);
        }
    };

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
                    width: { xs: '92%', sm: 560 },
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    outline: 'none',
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography id="edit-profile-title" variant="h5" component="h2" fontWeight="bold">
                        Chỉnh sửa thông tin
                    </Typography>
                    <IconButton size="medium" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Stack spacing={3}>
                    {/* Banner and Avatar Area */}
                    <Box sx={{ position: 'relative', width: '100%', height: 130 }}>
                        {/* Banner Selector */}
                        <Button 
                            component="label" 
                            sx={{ 
                                p: 0, 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '8px', 
                                overflow: 'hidden', 
                                display: 'block',
                                position: 'relative',
                                bgcolor: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                                textTransform: 'none',
                            }}
                        >
                            {bannerPreview || bannerUrl ? (
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
                                        backgroundImage: "linear-gradient(90deg, rgb(225, 193, 169) 0%, rgba(225, 193, 169, 0.314) 100%)" 
                                    }}
                                />
                            )}
                            <Box
                                className="banner-overlay"
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    bgcolor: 'rgba(0,0,0,0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    gap: 1
                                }}
                            >
                                <PhotoCameraIcon />
                                <Typography sx={{ fontWeight: 'bold', fontSize: 14 }}>Thay đổi ảnh bìa</Typography>
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
                                bottom: -45,
                                zIndex: 2 
                            }}
                        >
                            <Button component="label" sx={{ p: 0, borderRadius: '50%', position: 'relative', bgcolor: '#fff', border: '4px solid #fff' }}>
                                <Avatar
                                    src={avatarPreview || avatarUrl || undefined}
                                    sx={{ width: 90, height: 90, border: '1px solid #ddd' }}
                                >
                                    {fullName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: 2,
                                        bottom: 2,
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        bgcolor: '#e5e7eb',
                                        color: '#111827',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                                    }}
                                >
                                    <PhotoCameraIcon sx={{ fontSize: 15 }} />
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
                    <Box sx={{ height: '40px' }} />

                    <TextField
                        label="Họ và tên"
                        variant="outlined"
                        fullWidth
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                    />
                    <TextField
                        label="Bio"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={5}
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                    />
                </Stack>

                <Stack direction="row" justifyContent="flex-end" spacing={2} mt={4}>
                    <Button variant="outlined" onClick={handleClose} disabled={saving}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        disabled={saving}
                        onClick={handleSave}
                        sx={{ px: 5, background: 'linear-gradient(90deg, #4f8dfd, #3b82f6)' }}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}
