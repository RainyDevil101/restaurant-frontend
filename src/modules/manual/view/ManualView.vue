<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import { Role } from '@/shared/types';
import { colors } from '@/shared/styles/colors';

type Step = { title: string; detail: string };
type Faq = { question: string; answer: string };
type Trouble = { problem: string; solution: string };
type Guide = {
  subtitle: string;
  intro: string;
  steps: Step[];
  tips: string[];
  troubles: Trouble[];
  faqs: Faq[];
  showTables: boolean;
};

const ICONS = {
  back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  mesero:
    'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  caja: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
  admin:
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  pasos: 'M7 5h14v2H7zm0 6h14v2H7zm0 6h14v2H7zM3 5h2v2H3zm0 6h2v2H3zm0 6h2v2H3z',
  mesas:
    'M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z',
  tips: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z',
  troubles:
    'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  faq: 'M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z',
  glosario:
    'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z',
} as const;

const ROLE_ORDER: Role[] = [Role.MESERO, Role.CAJERO, Role.ADMIN];

const ROLE_META: Record<Role, { label: string; icon: string }> = {
  [Role.MESERO]: { label: 'Mesero', icon: ICONS.mesero },
  [Role.CAJERO]: { label: 'Caja', icon: ICONS.caja },
  [Role.ADMIN]: { label: 'Admin', icon: ICONS.admin },
};

const TABLE_STATUSES = [
  {
    label: 'Libre',
    tone: colors.table.free,
    detail: 'La mesa está vacía y lista para un nuevo pedido.',
  },
  { label: 'Ocupada', tone: colors.table.occupied, detail: 'Ya tiene un pedido en curso.' },
  {
    label: 'Por cobrar',
    tone: colors.table.pendingPayment,
    detail: 'La caja la está cobrando; se libera al confirmar el pago.',
  },
];

const GLOSSARY = [
  {
    term: 'Comanda',
    definition: 'El detalle del pedido que llega a la cocina o a la barra para prepararlo.',
  },
  {
    term: 'Precuenta',
    definition:
      'Un resumen de la cuenta que puedes imprimir para que el cliente la revise antes de pagar.',
  },
  {
    term: 'Consolidar',
    definition: 'Juntar todos los pedidos de una mesa en una sola cuenta para cobrarla de una vez.',
  },
  {
    term: 'Área',
    definition:
      'El lugar donde se prepara un producto: cocina o barra. Define a dónde llega cada comanda.',
  },
];

const GUIDES: Record<Role, Guide> = {
  [Role.MESERO]: {
    subtitle: 'Guía para meseros',
    intro:
      'Con Subito tomas los pedidos desde tu teléfono y los envías directo a la caja y a la cocina, sin papeles.',
    steps: [
      {
        title: 'Inicia sesión',
        detail: 'Ingresa tu correo y tu PIN de 4 dígitos en la pantalla de inicio.',
      },
      {
        title: 'Elige una mesa',
        detail: 'Toca una mesa libre (en verde) para empezar un pedido nuevo.',
      },
      {
        title: 'Agrega productos',
        detail:
          'Busca el producto por su nombre o usa las categorías de arriba. Toca un producto para sumarlo al pedido.',
      },
      {
        title: 'Ajusta las cantidades',
        detail: 'Usa los botones + y − para cambiar cuántos lleva cada producto.',
      },
      {
        title: 'Revisa y envía',
        detail:
          'Confirma que el pedido esté correcto y toca «Enviar a caja». La mesa queda como ocupada.',
      },
      {
        title: 'Agrega más cuando lo pidan',
        detail: 'Puedes volver a la misma mesa y sumar más productos en cualquier momento.',
      },
    ],
    tips: [
      'Si no encuentras un producto, escribe parte de su nombre en el buscador.',
      'Puedes atender varias mesas a la vez: cada una guarda su propio pedido.',
      'Cuando la caja cobra la mesa, esta se libera sola y vuelve a quedar verde.',
    ],
    troubles: [
      {
        problem: 'Me equivoqué de mesa',
        solution:
          'Vuelve atrás y elige la mesa correcta antes de enviar. Si ya enviaste, avísale a la caja.',
      },
      {
        problem: 'Un producto no aparece',
        solution:
          'Puede estar marcado como no disponible. Avísale al administrador para que lo active.',
      },
      {
        problem: 'Agregué un producto de más',
        solution:
          'Usa el botón − para bajar la cantidad, o déjala en cero para quitarlo antes de enviar.',
      },
    ],
    faqs: [
      {
        question: '¿El cliente ve el pedido en su teléfono?',
        answer:
          'No. El pedido va directo a la caja y a la cocina; el cliente no necesita instalar nada.',
      },
      {
        question: '¿Qué pasa si se corta el internet?',
        answer:
          'Vuelve a intentarlo cuando se recupere la señal. Si un pedido no se envió, te avisará con un mensaje.',
      },
    ],
    showTables: true,
  },
  [Role.CAJERO]: {
    subtitle: 'Guía para caja',
    intro:
      'En la caja ves en tiempo real las mesas con pedidos y cobras cada cuenta de forma consolidada.',
    steps: [
      { title: 'Inicia sesión', detail: 'Ingresa tu correo y tu contraseña.' },
      {
        title: 'Mira las mesas activas',
        detail:
          'El panel muestra las mesas con pedidos y se actualiza solo cuando un mesero envía algo nuevo.',
      },
      {
        title: 'Abre una mesa',
        detail: 'Toca una mesa para ver todos sus productos juntos y el total a cobrar.',
      },
      {
        title: 'Pasa al cobro',
        detail: 'Cuando el cliente pide la cuenta, toca «Proceder al cobro».',
      },
      {
        title: 'Elige el medio de pago',
        detail:
          'Selecciona Efectivo o Tarjeta. Si es efectivo, escribe el monto recibido y Subito calcula el vuelto.',
      },
      {
        title: 'Confirma el pago',
        detail:
          'Toca «Confirmar pago». La mesa se libera automáticamente y queda lista para el siguiente cliente.',
      },
    ],
    tips: [
      'Puedes imprimir la precuenta antes de cobrar, sin cerrar la mesa.',
      'El indicador «En vivo» confirma que estás recibiendo los pedidos al instante.',
      'Para cancelar un pedido necesitas la autorización de un administrador.',
    ],
    troubles: [
      {
        problem: 'Me equivoqué en el monto recibido',
        solution:
          'Vuelve a escribir el monto correcto; el vuelto se recalcula solo antes de confirmar.',
      },
      {
        problem: 'Hay que anular un pedido',
        solution: 'La cancelación requiere que un administrador la autorice con sus credenciales.',
      },
      {
        problem: 'El cliente quiere dividir el pago',
        solution: 'Por ahora cada cuenta se cobra con un solo medio de pago, efectivo o tarjeta.',
      },
    ],
    faqs: [
      {
        question: '¿La mesa se libera sola?',
        answer: 'Sí. Al confirmar el pago, la mesa vuelve a quedar libre automáticamente.',
      },
      {
        question: '¿Puedo ver la cuenta sin cobrar?',
        answer: 'Sí. Abre la mesa o imprime la precuenta; eso no cierra ni cobra la cuenta.',
      },
    ],
    showTables: true,
  },
  [Role.ADMIN]: {
    subtitle: 'Guía para administración',
    intro:
      'Desde el panel de administración configuras todo lo que usan los meseros y la caja, y revisas las ventas.',
    steps: [
      { title: 'Inicia sesión', detail: 'Ingresa con tu correo y contraseña de administrador.' },
      {
        title: 'Arma tu carta',
        detail:
          'En Productos, Categorías y Menús creas y editas lo que se vende. Marca un producto como no disponible cuando se agote.',
      },
      {
        title: 'Define áreas y mesas',
        detail:
          'En Áreas separas cocina y barra, que es a dónde va cada comanda. En Mesas defines las mesas del local y su capacidad.',
      },
      {
        title: 'Crea los usuarios',
        detail:
          'En Usuarios agregas a tu equipo y les asignas su rol: mesero, caja o administración.',
      },
      {
        title: 'Revisa las ventas',
        detail: 'En Pagos ves el historial de cobros: mesa, método de pago, total y vuelto.',
      },
      {
        title: 'Configura impresión y recibo',
        detail:
          'En Configuraciones conectas la impresora y editas el encabezado y el pie del recibo.',
      },
    ],
    tips: [
      'Los cambios que haces se reflejan al instante en los teléfonos de los meseros y en la caja.',
      'Con «Tomar pedido» e «Ir a caja» puedes entrar a esas pantallas para revisarlas tú mismo.',
      'Las cuentas de usuario no se borran: se desactivan para conservar el historial.',
    ],
    troubles: [
      {
        problem: 'Un mesero no puede iniciar sesión',
        solution: 'Revisa en Usuarios que su cuenta esté activa y que el PIN sea el correcto.',
      },
      {
        problem: 'Un producto no le aparece al mesero',
        solution: 'Verifica que esté disponible y que tenga una categoría asignada.',
      },
      {
        problem: 'La impresora no imprime',
        solution:
          'Revisa en Configuraciones que esté conectada y que el navegador sea Chrome o Edge.',
      },
    ],
    faqs: [
      {
        question: '¿Los cambios se aplican al instante?',
        answer: 'Sí. Apenas guardas, los meseros y la caja ven la versión actualizada.',
      },
      {
        question: '¿Necesito instalar algo?',
        answer:
          'No. Subito funciona en el navegador y puedes agregarlo a la pantalla de inicio como una app.',
      },
    ],
    showTables: false,
  },
};

const SECTIONS = [
  { id: 'pasos', label: 'Paso a paso', icon: ICONS.pasos },
  { id: 'mesas', label: 'Estados de las mesas', icon: ICONS.mesas, tablesOnly: true },
  { id: 'tips', label: 'Bueno saber', icon: ICONS.tips },
  { id: 'problemas', label: '¿Qué hago si…?', icon: ICONS.troubles },
  { id: 'faq', label: 'Preguntas frecuentes', icon: ICONS.faq },
  { id: 'glosario', label: 'Glosario', icon: ICONS.glosario },
] as const;

const router = useRouter();
const auth = useAuthStore();

const activeRole = ref<Role>(auth.user?.role ?? Role.MESERO);
const activeGuide = computed(() => GUIDES[activeRole.value]);
const visibleSections = computed(() =>
  SECTIONS.filter((section) => !('tablesOnly' in section) || activeGuide.value.showTables),
);

const tabEls: Record<string, HTMLButtonElement | null> = {};

function selectRole(role: Role) {
  activeRole.value = role;
}

function onTabKeydown(event: KeyboardEvent, role: Role) {
  const index = ROLE_ORDER.indexOf(role);
  let next: Role | null = null;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    next = ROLE_ORDER[(index + 1) % ROLE_ORDER.length]!;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    next = ROLE_ORDER[(index + ROLE_ORDER.length - 1) % ROLE_ORDER.length]!;
  } else if (event.key === 'Home') {
    next = ROLE_ORDER[0]!;
  } else if (event.key === 'End') {
    next = ROLE_ORDER[ROLE_ORDER.length - 1]!;
  }
  if (!next) return;
  event.preventDefault();
  activeRole.value = next;
  const target = next;
  void nextTick(() => tabEls[target]?.focus());
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(auth.roleHome);
  }
}
</script>

<template>
  <div class="manual-page">
    <header class="manual-topbar">
      <div class="topbar-row">
        <button class="back-btn" aria-label="Volver" @click="goBack">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
            <path :d="ICONS.back" />
          </svg>
          <span>Volver</span>
        </button>
        <h1 class="manual-title">Manual de uso</h1>
      </div>

      <div class="role-tabs" role="tablist" aria-label="Elige una guía">
        <button
          v-for="role in ROLE_ORDER"
          :key="role"
          :ref="
            (el) => {
              tabEls[role] = el as HTMLButtonElement | null;
            }
          "
          :id="`tab-${role}`"
          type="button"
          role="tab"
          class="role-tab"
          :class="{ 'role-tab--active': activeRole === role }"
          :aria-selected="activeRole === role"
          :aria-controls="`panel-${role}`"
          :tabindex="activeRole === role ? 0 : -1"
          @click="selectRole(role)"
          @keydown="onTabKeydown($event, role)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
            <path :d="ROLE_META[role].icon" />
          </svg>
          {{ ROLE_META[role].label }}
        </button>
      </div>
    </header>

    <main id="main" tabindex="-1" class="manual-body" aria-label="Manual de uso">
      <nav class="toc" aria-label="En esta página">
        <p class="toc-title">En esta página</p>
        <a
          v-for="section in visibleSections"
          :key="section.id"
          :href="`#${section.id}`"
          class="toc-link"
        >
          {{ section.label }}
        </a>
      </nav>

      <div
        :id="`panel-${activeRole}`"
        role="tabpanel"
        :aria-labelledby="`tab-${activeRole}`"
        tabindex="0"
        class="manual-content"
      >
        <section class="hero">
          <div class="hero-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
              <path :d="ROLE_META[activeRole].icon" />
            </svg>
          </div>
          <div>
            <h2 class="hero-title">{{ activeGuide.subtitle }}</h2>
            <p class="hero-intro">{{ activeGuide.intro }}</p>
          </div>
        </section>

        <section id="pasos" class="block">
          <h3 class="block-title">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path :d="ICONS.pasos" />
            </svg>
            Paso a paso
          </h3>
          <ol class="steps">
            <li v-for="(step, index) in activeGuide.steps" :key="step.title" class="step">
              <span class="step-num" aria-hidden="true">{{ index + 1 }}</span>
              <div>
                <h4 class="step-title">{{ step.title }}</h4>
                <p class="step-detail">{{ step.detail }}</p>
              </div>
            </li>
          </ol>
        </section>

        <section v-if="activeGuide.showTables" id="mesas" class="block">
          <h3 class="block-title">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path :d="ICONS.mesas" />
            </svg>
            Estados de las mesas
          </h3>
          <div class="status-grid">
            <div v-for="status in TABLE_STATUSES" :key="status.label" class="status-card">
              <span
                class="status-chip"
                :style="{ background: status.tone.bg, color: status.tone.text }"
              >
                {{ status.label }}
              </span>
              <p class="status-detail">{{ status.detail }}</p>
            </div>
          </div>
        </section>

        <section id="tips" class="block">
          <h3 class="block-title">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path :d="ICONS.tips" />
            </svg>
            Bueno saber
          </h3>
          <ul class="tips">
            <li v-for="tip in activeGuide.tips" :key="tip" class="tip">{{ tip }}</li>
          </ul>
        </section>

        <section id="problemas" class="block">
          <h3 class="block-title">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path :d="ICONS.troubles" />
            </svg>
            ¿Qué hago si…?
          </h3>
          <div class="cards">
            <div v-for="item in activeGuide.troubles" :key="item.problem" class="card">
              <h4 class="card-q">{{ item.problem }}</h4>
              <p class="card-a">{{ item.solution }}</p>
            </div>
          </div>
        </section>

        <section id="faq" class="block">
          <h3 class="block-title">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path :d="ICONS.faq" />
            </svg>
            Preguntas frecuentes
          </h3>
          <div class="cards">
            <div v-for="item in activeGuide.faqs" :key="item.question" class="card">
              <h4 class="card-q">{{ item.question }}</h4>
              <p class="card-a">{{ item.answer }}</p>
            </div>
          </div>
        </section>

        <section id="glosario" class="block">
          <h3 class="block-title">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path :d="ICONS.glosario" />
            </svg>
            Glosario
          </h3>
          <dl class="glossary">
            <div v-for="entry in GLOSSARY" :key="entry.term" class="glossary-row">
              <dt class="glossary-term">{{ entry.term }}</dt>
              <dd class="glossary-def">{{ entry.definition }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.manual-page {
  min-height: 100dvh;
  background: v-bind('colors.neutral.surface');
}

.manual-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: v-bind('colors.neutral.background');
  border-bottom: 1px solid v-bind('colors.neutral.border');
}

.topbar-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  background: none;
  border: 1.5px solid v-bind('colors.neutral.border');
  border-radius: 8px;
  font-size: var(--font-sm);
  font-weight: 600;
  color: v-bind('colors.neutral.textMedium');
  transition: background 0.12s;
}

.back-btn:hover {
  background: v-bind('colors.neutral.borderSubtle');
}

.manual-title {
  font-size: var(--font-lg);
  font-weight: 800;
  color: v-bind('colors.neutral.textStrong');
}

.role-tabs {
  display: flex;
  gap: 6px;
  padding: 0 1.25rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.role-tabs::-webkit-scrollbar {
  display: none;
}

.role-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  min-height: 2.75rem;
  padding: 0 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: var(--font-sm);
  font-weight: 600;
  color: v-bind('colors.neutral.secondary');
  transition:
    color 0.12s,
    border-color 0.12s;
}

.role-tab:hover {
  color: v-bind('colors.neutral.textStrong');
}

.role-tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.manual-body {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 1.25rem 3rem;
}

.toc {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}

.toc::-webkit-scrollbar {
  display: none;
}

.toc-title {
  display: none;
}

.toc-link {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: v-bind('colors.neutral.background');
  border: 1px solid v-bind('colors.neutral.border');
  font-size: var(--font-xs);
  font-weight: 600;
  color: v-bind('colors.neutral.textMedium');
  white-space: nowrap;
}

.toc-link:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.manual-content {
  flex: 1;
  min-width: 0;
}

.hero {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: v-bind('colors.neutral.background');
}

.hero-icon {
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: v-bind('colors.neutral.background');
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-title {
  font-size: var(--font-xl);
  font-weight: 800;
}

.hero-intro {
  margin-top: 4px;
  font-size: var(--font-base);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.92);
}

.block {
  margin-top: 2rem;
  scroll-margin-top: 8rem;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-lg);
  font-weight: 700;
  color: v-bind('colors.neutral.textStrong');
}

.block-title svg {
  color: var(--color-primary);
}

.steps {
  list-style: none;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.step {
  display: flex;
  gap: 0.875rem;
  padding: 1rem;
  border-radius: 12px;
  background: v-bind('colors.neutral.background');
  border: 1px solid v-bind('colors.neutral.border');
}

.step-num {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--color-primary);
  color: v-bind('colors.neutral.background');
  font-size: var(--font-sm);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-title {
  font-size: var(--font-base);
  font-weight: 700;
  color: v-bind('colors.neutral.textStrong');
}

.step-detail {
  margin-top: 2px;
  font-size: var(--font-base);
  line-height: 1.55;
  color: v-bind('colors.neutral.textMedium');
}

.status-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.875rem;
}

.status-card {
  padding: 1rem;
  border-radius: 12px;
  background: v-bind('colors.neutral.background');
  border: 1px solid v-bind('colors.neutral.border');
}

.status-chip {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: var(--font-xs);
  font-weight: 700;
}

.status-detail {
  margin-top: 0.625rem;
  font-size: var(--font-sm);
  line-height: 1.5;
  color: v-bind('colors.neutral.textMedium');
}

.tips {
  list-style: none;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem 1.25rem;
  background: v-bind('colors.neutral.background');
  border: 1px solid v-bind('colors.neutral.border');
  border-left: 4px solid var(--color-primary);
  border-radius: 10px;
}

.tip {
  position: relative;
  padding-left: 1.25rem;
  font-size: var(--font-base);
  line-height: 1.5;
  color: v-bind('colors.neutral.textMedium');
}

.tip::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.cards {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.875rem;
}

.card {
  padding: 1rem 1.125rem;
  border-radius: 12px;
  background: v-bind('colors.neutral.background');
  border: 1px solid v-bind('colors.neutral.border');
}

.card-q {
  font-size: var(--font-base);
  font-weight: 700;
  color: v-bind('colors.neutral.textStrong');
}

.card-a {
  margin-top: 4px;
  font-size: var(--font-sm);
  line-height: 1.55;
  color: v-bind('colors.neutral.textMedium');
}

.glossary {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.glossary-row {
  padding: 0.875rem 1.125rem;
  border-radius: 12px;
  background: v-bind('colors.neutral.background');
  border: 1px solid v-bind('colors.neutral.border');
}

.glossary-term {
  font-size: var(--font-base);
  font-weight: 700;
  color: var(--color-primary-dark);
}

.glossary-def {
  margin-top: 2px;
  font-size: var(--font-sm);
  line-height: 1.55;
  color: v-bind('colors.neutral.textMedium');
}

@media (min-width: 860px) {
  .manual-body {
    flex-direction: row;
    align-items: flex-start;
    gap: 2rem;
  }

  .toc {
    position: sticky;
    top: 8rem;
    flex-direction: column;
    width: 13rem;
    flex-shrink: 0;
    overflow-x: visible;
  }

  .toc-title {
    display: block;
    padding: 0 12px 4px;
    font-size: var(--font-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: v-bind('colors.neutral.secondary');
  }

  .toc-link {
    background: none;
    border: none;
    border-left: 2px solid v-bind('colors.neutral.border');
    border-radius: 0;
    padding: 6px 12px;
  }

  .toc-link:hover {
    border-left-color: var(--color-primary);
  }
}
</style>
