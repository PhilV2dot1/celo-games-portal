/**
 * Tests for Avatar/Banner Upload and Unlock APIs
 *
 * Covers:
 * - POST /api/user/avatar/upload - Custom avatar upload
 * - POST /api/user/banner/upload - Custom banner upload
 * - GET /api/avatars/check-unlock - Check unlock eligibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST as avatarPOST } from '@/app/api/user/avatar/upload/route';
import { POST as bannerPOST } from '@/app/api/user/banner/upload/route';
import { GET as checkUnlockGET } from '@/app/api/avatars/check-unlock/route';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';

const mockCreateClient = createClient as ReturnType<typeof vi.fn>;
const mockCreateServerClient = createServerClient as ReturnType<typeof vi.fn>;

// Helper to create Next.js-style request with nextUrl
function createNextRequest(url: string, init?: RequestInit) {
  const request = new Request(url, init);
  const nextUrl = new URL(url);
  return Object.assign(request, { nextUrl });
}

// Helper to create mock File
function createMockFile(name: string, type: string, size: number): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('Avatar/Banner Upload and Unlock APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // POST /api/user/avatar/upload
  // ============================================================

  describe('POST /api/user/avatar/upload', () => {
    let mockSupabase: any;

    beforeEach(() => {
      mockSupabase = {
        from: vi.fn(),
        storage: {
          from: vi.fn(),
        },
      };

      mockCreateClient.mockReturnValue(mockSupabase);
    });

    describe('Success Cases', () => {
      it('should successfully upload avatar when unlocked', async () => {
        const mockFile = createMockFile('avatar.jpg', 'image/jpeg', 1024 * 1024); // 1MB

        // Mock user check - avatar unlocked
        const userChain: any = {
          select: vi.fn(() => userChain),
          eq: vi.fn(() => userChain),
          single: vi.fn().mockResolvedValue({
            data: { avatar_unlocked: true },
            error: null,
          }),
        };

        // Mock storage upload
        const storageChain: any = {
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://storage.example.com/avatars/user-123-12345.jpg' },
          }),
          remove: vi.fn(),
        };

        // Mock database update
        const updateChain: any = {
          update: vi.fn(() => updateChain),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };

        mockSupabase.from
          .mockReturnValueOnce(userChain) // Check user
          .mockReturnValueOnce(updateChain); // Update user

        mockSupabase.storage.from.mockReturnValue(storageChain);

        const formData = new FormData();
        formData.append('avatar', mockFile);
        formData.append('userId', 'user-123');

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          success: true,
          avatarUrl: 'https://storage.example.com/avatars/user-123-12345.jpg',
          message: 'Avatar uploadé avec succès!',
        });

        // Verify upload was called
        expect(storageChain.upload).toHaveBeenCalledWith(
          expect.stringMatching(/^avatars\/user-123-\d+\.jpg$/),
          expect.any(Uint8Array),
          {
            contentType: 'image/jpeg',
            upsert: false,
          }
        );

        // Verify database update
        expect(updateChain.update).toHaveBeenCalledWith({
          avatar_type: 'custom',
          avatar_url: 'https://storage.example.com/avatars/user-123-12345.jpg',
          updated_at: expect.any(String),
        });
      });

      it('should handle PNG file type', async () => {
        const mockFile = createMockFile('avatar.png', 'image/png', 512 * 1024);

        const userChain: any = {
          select: vi.fn(() => userChain),
          eq: vi.fn(() => userChain),
          single: vi.fn().mockResolvedValue({
            data: { avatar_unlocked: true },
            error: null,
          }),
        };

        const storageChain: any = {
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://storage.example.com/avatars/user-456.png' },
          }),
        };

        const updateChain: any = {
          update: vi.fn(() => updateChain),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };

        mockSupabase.from
          .mockReturnValueOnce(userChain)
          .mockReturnValueOnce(updateChain);

        mockSupabase.storage.from.mockReturnValue(storageChain);

        const formData = new FormData();
        formData.append('avatar', mockFile);
        formData.append('userId', 'user-456');

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);

        expect(response.status).toBe(200);
        expect(storageChain.upload).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Uint8Array),
          {
            contentType: 'image/png',
            upsert: false,
          }
        );
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when file is missing', async () => {
        const formData = new FormData();
        formData.append('userId', 'user-123');

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Fichier et ID utilisateur requis');
      });

      it('should return 400 when userId is missing', async () => {
        const mockFile = createMockFile('avatar.jpg', 'image/jpeg', 1024);
        const formData = new FormData();
        formData.append('avatar', mockFile);

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Fichier et ID utilisateur requis');
      });

      it('should return 400 for unsupported file type', async () => {
        const mockFile = createMockFile('avatar.bmp', 'image/bmp', 1024);

        const formData = new FormData();
        formData.append('avatar', mockFile);
        formData.append('userId', 'user-123');

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Type de fichier non supporté. Utilisez JPEG, PNG, WebP ou GIF.');
      });

      it('should return 400 when file size exceeds 2MB', async () => {
        const mockFile = createMockFile('avatar.jpg', 'image/jpeg', 3 * 1024 * 1024); // 3MB

        const formData = new FormData();
        formData.append('avatar', mockFile);
        formData.append('userId', 'user-123');

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Fichier trop volumineux. Taille maximale: 2MB.');
      });
    });

    describe('Authorization Errors', () => {
      it('should return 404 when user not found', async () => {
        const mockFile = createMockFile('avatar.jpg', 'image/jpeg', 1024);

        const userChain: any = {
          select: vi.fn(() => userChain),
          eq: vi.fn(() => userChain),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        };

        mockSupabase.from.mockReturnValueOnce(userChain);

        const formData = new FormData();
        formData.append('avatar', mockFile);
        formData.append('userId', 'non-existent');

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Utilisateur non trouvé');
      });

      it('should return 403 when avatar not unlocked', async () => {
        const mockFile = createMockFile('avatar.jpg', 'image/jpeg', 1024);

        const userChain: any = {
          select: vi.fn(() => userChain),
          eq: vi.fn(() => userChain),
          single: vi.fn().mockResolvedValue({
            data: { avatar_unlocked: false },
            error: null,
          }),
        };

        mockSupabase.from.mockReturnValueOnce(userChain);

        const formData = new FormData();
        formData.append('avatar', mockFile);
        formData.append('userId', 'user-locked');

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toContain('Upload d\'avatar personnalisé non débloqué');
      });
    });

    describe('Error Handling', () => {
      it('should return 500 when storage upload fails', async () => {
        const mockFile = createMockFile('avatar.jpg', 'image/jpeg', 1024);

        const userChain: any = {
          select: vi.fn(() => userChain),
          eq: vi.fn(() => userChain),
          single: vi.fn().mockResolvedValue({
            data: { avatar_unlocked: true },
            error: null,
          }),
        };

        const storageChain: any = {
          upload: vi.fn().mockResolvedValue({ error: { message: 'Upload failed' } }),
        };

        mockSupabase.from.mockReturnValueOnce(userChain);
        mockSupabase.storage.from.mockReturnValue(storageChain);

        const formData = new FormData();
        formData.append('avatar', mockFile);
        formData.append('userId', 'user-123');

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Échec de l\'upload du fichier');
      });

      it('should clean up file and return 500 when database update fails', async () => {
        const mockFile = createMockFile('avatar.jpg', 'image/jpeg', 1024);

        const userChain: any = {
          select: vi.fn(() => userChain),
          eq: vi.fn(() => userChain),
          single: vi.fn().mockResolvedValue({
            data: { avatar_unlocked: true },
            error: null,
          }),
        };

        const storageChain: any = {
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://storage.example.com/avatars/test.jpg' },
          }),
          remove: vi.fn().mockResolvedValue({ error: null }),
        };

        const updateChain: any = {
          update: vi.fn(() => updateChain),
          eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
        };

        mockSupabase.from
          .mockReturnValueOnce(userChain)
          .mockReturnValueOnce(updateChain);

        mockSupabase.storage.from.mockReturnValue(storageChain);

        const formData = new FormData();
        formData.append('avatar', mockFile);
        formData.append('userId', 'user-123');

        const request = new Request('http://localhost/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await avatarPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Échec de la mise à jour du profil');
        // Verify file cleanup was attempted
        expect(storageChain.remove).toHaveBeenCalled();
      });
    });
  });

  // ============================================================
  // POST /api/user/banner/upload
  // ============================================================

  describe('POST /api/user/banner/upload', () => {
    let mockSupabase: any;

    beforeEach(() => {
      mockSupabase = {
        auth: {
          getUser: vi.fn(),
        },
        from: vi.fn(),
        storage: {
          from: vi.fn(),
        },
      };

      mockCreateServerClient.mockReturnValue(mockSupabase);
    });

    describe('Success Cases', () => {
      it('should successfully upload banner when authenticated and unlocked', async () => {
        const mockFile = createMockFile('banner.jpg', 'image/jpeg', 2 * 1024 * 1024); // 2MB

        // Mock authentication
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null,
        });

        // Mock user check
        const userChain: any = {
          select: vi.fn(() => userChain),
          eq: vi.fn(() => userChain),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'user-456', avatar_unlocked: true },
          }),
        };

        // Mock storage upload
        const storageChain: any = {
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://storage.example.com/banners/user-456/banner.jpg' },
          }),
          remove: vi.fn(),
        };

        // Mock database update
        const updateChain: any = {
          update: vi.fn(() => updateChain),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };

        mockSupabase.from
          .mockReturnValueOnce(userChain)
          .mockReturnValueOnce(updateChain);

        mockSupabase.storage.from.mockReturnValue(storageChain);

        const formData = new FormData();
        formData.append('file', mockFile);

        const request = new Request('http://localhost/api/user/banner/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await bannerPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          success: true,
          bannerUrl: 'https://storage.example.com/banners/user-456/banner.jpg',
          bannerType: 'custom',
        });

        // Verify upload to user-banners bucket
        expect(mockSupabase.storage.from).toHaveBeenCalledWith('user-banners');
        expect(storageChain.upload).toHaveBeenCalled();
      });
    });

    describe('Authentication Errors', () => {
      it('should return 401 when not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        });

        const mockFile = createMockFile('banner.jpg', 'image/jpeg', 1024);
        const formData = new FormData();
        formData.append('file', mockFile);

        const request = new Request('http://localhost/api/user/banner/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await bannerPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Non authentifié');
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when file is missing', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null,
        });

        // Create empty form data properly
        const formData = new FormData();
        const blob = new Blob([''], { type: 'text/plain' });
        formData.append('other', blob); // Add something to make it valid multipart

        const request = new Request('http://localhost/api/user/banner/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await bannerPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Fichier manquant');
      });

      it('should return 400 for unsupported file type (GIF not allowed for banners)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null,
        });

        const mockFile = createMockFile('banner.gif', 'image/gif', 1024);
        const formData = new FormData();
        formData.append('file', mockFile);

        const request = new Request('http://localhost/api/user/banner/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await bannerPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Type de fichier non supporté');
      });

      it('should return 400 when file size exceeds 5MB', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null,
        });

        const mockFile = createMockFile('banner.jpg', 'image/jpeg', 6 * 1024 * 1024); // 6MB
        const formData = new FormData();
        formData.append('file', mockFile);

        const request = new Request('http://localhost/api/user/banner/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await bannerPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Fichier trop volumineux. Maximum 5MB.');
      });
    });

    describe('Authorization Errors', () => {
      it('should return 403 when banner not unlocked', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null,
        });

        const userChain: any = {
          select: vi.fn(() => userChain),
          eq: vi.fn(() => userChain),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'user-456', avatar_unlocked: false },
          }),
        };

        mockSupabase.from.mockReturnValueOnce(userChain);

        const mockFile = createMockFile('banner.jpg', 'image/jpeg', 1024);
        const formData = new FormData();
        formData.append('file', mockFile);

        const request = new Request('http://localhost/api/user/banner/upload', {
          method: 'POST',
          body: formData,
        });

        const response = await bannerPOST(request as any);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toContain('Bannière personnalisée débloquée après 100 jeux');
        expect(data.unlocked).toBe(false);
      });
    });
  });

  // ============================================================
  // GET /api/avatars/check-unlock
  // ============================================================

  describe('GET /api/avatars/check-unlock', () => {
    let mockSupabase: any;

    beforeEach(() => {
      mockSupabase = {
        from: vi.fn(),
        rpc: vi.fn(),
      };

      mockCreateClient.mockReturnValue(mockSupabase);
    });

    describe('Success Cases', () => {
      it('should return unlocked=true when already unlocked', async () => {
        const userChain: any = {
          select: vi.fn(() => userChain),
          or: vi.fn(() => userChain),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'user-123', avatar_unlocked: true },
            error: null,
          }),
        };

        mockSupabase.from.mockReturnValueOnce(userChain);

        const request = createNextRequest('http://localhost/api/avatars/check-unlock?userId=user-123');
        const response = await checkUnlockGET(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          unlocked: true,
          reason: 'already_unlocked',
          message: 'Avatar personnalisé déjà débloqué',
        });
      });

      it('should check and auto-unlock when eligible (100 games)', async () => {
        const userChain: any = {
          select: vi.fn(() => userChain),
          or: vi.fn(() => userChain),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'user-456', avatar_unlocked: false },
            error: null,
          }),
        };

        // Mock RPC check - returns true
        mockSupabase.rpc.mockResolvedValue({ data: true, error: null });

        // Mock auto-unlock update
        const unlockChain: any = {
          update: vi.fn(() => unlockChain),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };

        // Mock games count check (count is returned in data, not count property)
        const gamesChain: any = {
          select: vi.fn(() => gamesChain),
          eq: vi.fn().mockResolvedValue({ data: 105, count: null }),
        };

        // Mock badges check (needs two .eq() calls)
        const badgesChain: any = {
          select: vi.fn(() => badgesChain),
          eq: vi.fn((field: string, value: any) => {
            // Return badgesChain for first .eq(), resolve for second
            if (field === 'user_id') {
              return badgesChain;
            }
            return Promise.resolve({ data: [] });
          }),
        };

        mockSupabase.from
          .mockReturnValueOnce(userChain) // Check user
          .mockReturnValueOnce(unlockChain) // Auto-unlock
          .mockReturnValueOnce(gamesChain) // Games count
          .mockReturnValueOnce(badgesChain); // Badges

        const request = createNextRequest('http://localhost/api/avatars/check-unlock?userId=user-456');
        const response = await checkUnlockGET(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.unlocked).toBe(true);
        expect(data.reason).toBe('100_games');
        expect(data.message).toBe('Avatar personnalisé débloqué !');
        expect(data.progress.gamesPlayed).toBe(105);

        // Verify auto-unlock was called
        expect(unlockChain.update).toHaveBeenCalledWith({ avatar_unlocked: true });
      });

      it('should return progress when not yet eligible', async () => {
        const userChain: any = {
          select: vi.fn(() => userChain),
          or: vi.fn(() => userChain),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'user-789', avatar_unlocked: false },
            error: null,
          }),
        };

        mockSupabase.rpc.mockResolvedValue({ data: false, error: null });

        const gamesChain: any = {
          select: vi.fn(() => gamesChain),
          eq: vi.fn().mockResolvedValue({ data: 45, count: null }),
        };

        const badgesChain: any = {
          select: vi.fn(() => badgesChain),
          eq: vi.fn((field: string) => {
            if (field === 'user_id') {
              return badgesChain;
            }
            return Promise.resolve({ data: [] });
          }),
        };

        mockSupabase.from
          .mockReturnValueOnce(userChain)
          .mockReturnValueOnce(gamesChain)
          .mockReturnValueOnce(badgesChain);

        const request = createNextRequest('http://localhost/api/avatars/check-unlock?userId=user-789');
        const response = await checkUnlockGET(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.unlocked).toBe(false);
        expect(data.reason).toBe('not_eligible');
        expect(data.message).toContain('Jouez 55 partie(s) de plus');
        expect(data.progress).toEqual({
          gamesPlayed: 45,
          gamesRequired: 100,
          hasVeteranBadge: false,
        });
      });

      it('should support userId from x-user-id header', async () => {
        const userChain: any = {
          select: vi.fn(() => userChain),
          or: vi.fn(() => userChain),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'user-header', avatar_unlocked: true },
            error: null,
          }),
        };

        mockSupabase.from.mockReturnValueOnce(userChain);

        const request = createNextRequest('http://localhost/api/avatars/check-unlock');
        request.headers.set('x-user-id', 'user-header');

        const response = await checkUnlockGET(request as any);

        expect(response.status).toBe(200);
        expect(userChain.or).toHaveBeenCalledWith('auth_user_id.eq.user-header,id.eq.user-header');
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when userId is missing', async () => {
        const request = createNextRequest('http://localhost/api/avatars/check-unlock');
        const response = await checkUnlockGET(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('ID utilisateur requis');
      });

      it('should return 404 when user not found', async () => {
        const userChain: any = {
          select: vi.fn(() => userChain),
          or: vi.fn(() => userChain),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        };

        mockSupabase.from.mockReturnValueOnce(userChain);

        const request = createNextRequest('http://localhost/api/avatars/check-unlock?userId=non-existent');
        const response = await checkUnlockGET(request as any);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Utilisateur non trouvé');
      });
    });

    describe('Error Handling', () => {
      it('should return 500 when RPC check fails', async () => {
        const userChain: any = {
          select: vi.fn(() => userChain),
          or: vi.fn(() => userChain),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'user-123', avatar_unlocked: false },
            error: null,
          }),
        };

        mockSupabase.from.mockReturnValueOnce(userChain);
        mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } });

        const request = createNextRequest('http://localhost/api/avatars/check-unlock?userId=user-123');
        const response = await checkUnlockGET(request as any);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Erreur lors de la vérification');
      });
    });
  });
});
