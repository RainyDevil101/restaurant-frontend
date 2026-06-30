<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowLeftIcon,
  UserIcon,
  CurrencyDollarIcon,
  GearIcon,
  ListBulletIcon,
  GridIcon,
  LightbulbIcon,
  WrenchIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
} from '@/modules/shared/components/icons';
import { useAuthStore } from '@/modules/auth/store';
import { Role, TABLE_STATUS } from '@/shared/types';
import { TABLE_STATUS_LABEL } from '@/shared/constants/labels';
import { UI_LABELS } from '@/shared/constants/ui';
import { PIN_LENGTH } from '@/shared/constants/validation';
import { MANUAL_SECTION, MANUAL_LABELS } from '../constants';
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

const ROLE_ORDER: Role[] = [Role.MESERO, Role.CAJERO, Role.ADMIN];

const ROLE_META: Record<Role, { label: string; icon: Component }> = {
  [Role.MESERO]: { label: 'Mesero', icon: UserIcon },
  [Role.CAJERO]: { label: 'Caja', icon: CurrencyDollarIcon },
  [Role.ADMIN]: { label: 'Admin', icon: GearIcon },
};

const TABLE_STATUSES = [
  {
    label: TABLE_STATUS_LABEL[TABLE_STATUS.FREE].label,
    tone: colors.table.free,
    detail: 'La mesa está vacía y lista para un nuevo pedido.',
  },
  {
    label: TABLE_STATUS_LABEL[TABLE_STATUS.OCCUPIED].label,
    tone: colors.table.occupied,
    detail: 'Ya tiene un pedido en curso.',
  },
  {
    label: TABLE_STATUS_LABEL[TABLE_STATUS.PENDING_PAYMENT].label,
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
        detail: `Ingresa tu correo y tu PIN de ${PIN_LENGTH} dígitos en la pantalla de inicio.`,
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
  MANUAL_SECTION.STEPS,
  { ...MANUAL_SECTION.TABLES, tablesOnly: true },
  MANUAL_SECTION.TIPS,
  MANUAL_SECTION.PROBLEMS,
  MANUAL_SECTION.FAQ,
  MANUAL_SECTION.GLOSSARY,
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
        <button class="back-btn" :aria-label="UI_LABELS.back" @click="goBack">
          <ArrowLeftIcon :size="20" />
          <span>{{ UI_LABELS.back }}</span>
        </button>
        <h1 class="manual-title">{{ MANUAL_LABELS.title }}</h1>
      </div>

      <div class="role-tabs" role="tablist" :aria-label="MANUAL_LABELS.chooseGuideAria">
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
          <component :is="ROLE_META[role].icon" :size="18" />
          {{ ROLE_META[role].label }}
        </button>
      </div>
    </header>

    <main id="main" tabindex="-1" class="manual-body" :aria-label="MANUAL_LABELS.title">
      <nav class="toc" :aria-label="MANUAL_LABELS.tocTitle">
        <p class="toc-title">{{ MANUAL_LABELS.tocTitle }}</p>
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
            <component :is="ROLE_META[activeRole].icon" :size="30" />
          </div>
          <div>
            <h2 class="hero-title">{{ activeGuide.subtitle }}</h2>
            <p class="hero-intro">{{ activeGuide.intro }}</p>
          </div>
        </section>

        <section :id="MANUAL_SECTION.STEPS.id" class="block">
          <h3 class="block-title">
            <ListBulletIcon :size="20" />
            {{ MANUAL_SECTION.STEPS.label }}
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

        <section v-if="activeGuide.showTables" :id="MANUAL_SECTION.TABLES.id" class="block">
          <h3 class="block-title">
            <GridIcon :size="20" />
            {{ MANUAL_SECTION.TABLES.label }}
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

        <section :id="MANUAL_SECTION.TIPS.id" class="block">
          <h3 class="block-title">
            <LightbulbIcon :size="20" />
            {{ MANUAL_SECTION.TIPS.label }}
          </h3>
          <ul class="tips">
            <li v-for="tip in activeGuide.tips" :key="tip" class="tip">{{ tip }}</li>
          </ul>
        </section>

        <section :id="MANUAL_SECTION.PROBLEMS.id" class="block">
          <h3 class="block-title">
            <WrenchIcon :size="20" />
            {{ MANUAL_SECTION.PROBLEMS.label }}
          </h3>
          <div class="cards">
            <div v-for="item in activeGuide.troubles" :key="item.problem" class="card">
              <h4 class="card-q">{{ item.problem }}</h4>
              <p class="card-a">{{ item.solution }}</p>
            </div>
          </div>
        </section>

        <section :id="MANUAL_SECTION.FAQ.id" class="block">
          <h3 class="block-title">
            <QuestionMarkCircleIcon :size="20" />
            {{ MANUAL_SECTION.FAQ.label }}
          </h3>
          <div class="cards">
            <div v-for="item in activeGuide.faqs" :key="item.question" class="card">
              <h4 class="card-q">{{ item.question }}</h4>
              <p class="card-a">{{ item.answer }}</p>
            </div>
          </div>
        </section>

        <section :id="MANUAL_SECTION.GLOSSARY.id" class="block">
          <h3 class="block-title">
            <BookOpenIcon :size="20" />
            {{ MANUAL_SECTION.GLOSSARY.label }}
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
