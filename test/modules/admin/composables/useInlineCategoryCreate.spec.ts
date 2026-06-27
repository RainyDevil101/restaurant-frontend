import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { ApiRequestError } from '@/shared/api/client';
import { useInlineCategoryCreate } from '@/modules/admin/composables/useInlineCategoryCreate';

type CreateFn = (input: { name: string; areaId: string }) => Promise<{ id: string }>;

function withSetup(
  createFn: CreateFn,
  opts?: { onCreated?: (id: string) => void },
): ReturnType<typeof useInlineCategoryCreate> {
  let result!: ReturnType<typeof useInlineCategoryCreate>;
  mount(
    defineComponent({
      setup() {
        result = useInlineCategoryCreate(createFn, opts);
        return () => h('div');
      },
    }),
  );
  return result;
}

describe('useInlineCategoryCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates the category, clears inputs and notifies onCreated with the new id', async () => {
    const createFn = vi.fn<CreateFn>().mockResolvedValue({ id: 'c99' });
    const onCreated = vi.fn<(id: string) => void>();
    const { inputName, inputAreaId, creating, error, submit } = withSetup(createFn, { onCreated });
    inputName.value = '  Bebidas  ';
    inputAreaId.value = 'a1';
    await submit();
    expect(createFn).toHaveBeenCalledWith({ name: 'Bebidas', areaId: 'a1' });
    expect(inputName.value).toBe('');
    expect(inputAreaId.value).toBe('');
    expect(error.value).toBe('');
    expect(creating.value).toBe(false);
    expect(onCreated).toHaveBeenCalledWith('c99');
  });

  it('does nothing when the name is empty or whitespace', async () => {
    const createFn = vi.fn<CreateFn>().mockResolvedValue({ id: 'c1' });
    const { inputName, inputAreaId, submit } = withSetup(createFn);
    inputName.value = '   ';
    inputAreaId.value = 'a1';
    await submit();
    expect(createFn).not.toHaveBeenCalled();
  });

  it('errors when no area is selected', async () => {
    const createFn = vi.fn<CreateFn>().mockResolvedValue({ id: 'c1' });
    const { inputName, inputAreaId, error, submit } = withSetup(createFn);
    inputName.value = 'Bebidas';
    inputAreaId.value = '';
    await submit();
    expect(createFn).not.toHaveBeenCalled();
    expect(error.value).toBe('Selecciona un área.');
  });

  it('captures an ApiRequestError message and resets creating', async () => {
    const createFn = vi
      .fn<CreateFn>()
      .mockRejectedValue(new ApiRequestError('Categoría duplicada', 409, null));
    const onCreated = vi.fn<(id: string) => void>();
    const { inputName, inputAreaId, creating, error, submit } = withSetup(createFn, { onCreated });
    inputName.value = 'Bebidas';
    inputAreaId.value = 'a1';
    await submit();
    expect(error.value).toBe('Categoría duplicada');
    expect(creating.value).toBe(false);
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('falls back to a generic message for non-API errors', async () => {
    const createFn = vi.fn<CreateFn>().mockRejectedValue(new Error('boom'));
    const { inputName, inputAreaId, error, submit } = withSetup(createFn);
    inputName.value = 'Bebidas';
    inputAreaId.value = 'a1';
    await submit();
    expect(error.value).toBe('No se pudo crear.');
  });
});
