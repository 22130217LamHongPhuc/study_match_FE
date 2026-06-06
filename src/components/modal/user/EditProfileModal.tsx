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
    }, [stateModal, profile]);

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

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
            const updated = await updateUserProfileService(userId, {
                fullName: fullName.trim(),
                bio: bio.trim(),
                avatarUrl: uploadedAvatar?.mediaUrl || avatarUrl,
            });
            onProfileUpdated?.({
                ...(profile as UserProfile),
                ...updated,
                fullName: updated?.fullName ?? fullName.trim(),
                bio: updated?.bio ?? bio.trim(),
                avatarUrl: updated?.avatarUrl ?? uploadedAvatar?.mediaUrl ?? avatarUrl ?? '',
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
                    <Box textAlign="center" mb={1}>
                        <Button component="label" sx={{ p: 0, borderRadius: '50%', position: 'relative' }}>
                            <Avatar
                                src={avatarPreview || avatarUrl || undefined}
                                sx={{ width: 126, height: 126, mx: 'auto', border: '2px solid #ddd' }}
                            >
                                {fullName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    bottom: 8,
                                    width: 34,
                                    height: 34,
                                    borderRadius: '50%',
                                    bgcolor: '#e5e7eb',
                                    color: '#111827',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                                }}
                            >
                                <PhotoCameraIcon sx={{ fontSize: 19 }} />
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
