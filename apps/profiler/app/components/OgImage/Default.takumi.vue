<script setup lang="ts">
defineProps<{
  kicker?: string;
  headline1?: string;
  headlineEm?: string;
  headline2?: string;
  tagline?: string;
  badgeSpec?: string;
  badgeLicense?: string;
  badgeSite?: string;
}>();

const LOGO_DATA_URI = `data:image/png;base64,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`;
</script>

<template>
  <div
    style="
      width: 1200px;
      height: 630px;
      display: flex;
      flex-direction: column;
      background-color: #ffffff;
      padding: 88px;
    "
  >
    <div
      style="
        display: flex;
        align-items: center;
        margin-bottom: 36px;
      "
    >
      <img
        :src="LOGO_DATA_URI"
        style="width: 40px; height: 40px; margin-right: 14px;"
      />
      <div
        style="
          display: flex;
          font-size: 24px;
          font-weight: 700;
          color: #0d1218;
          letter-spacing: -0.01em;
        "
      >
        welldot
      </div>
    </div>

    <div
      style="
        display: flex;
        font-size: 15px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #7888a0;
        margin-bottom: 22px;
      "
    >
      {{ kicker || '.well · open format' }}
    </div>

    <div
      style="
        display: flex;
        flex-wrap: wrap;
        font-weight: 500;
        font-size: 62px;
        line-height: 1.12;
        letter-spacing: -0.01em;
        color: #0d1218;
        max-width: 980px;
        margin-bottom: 28px;
      "
    >
      <span>{{ headline1 || 'Well profiles, in' }}&nbsp;</span>
      <span style="font-style: italic; color: #2f5fae;">{{ headlineEm || 'open format' }}</span>
      <span>{{ headline2 || '.' }}</span>
    </div>

    <div
      class="font-display"
      style="
        display: flex;
        font-size: 26px;
        line-height: 1.5;
        color: #4f5d75;
        max-width: 780px;
      "
    >
      {{ tagline || 'Free editor to create, visualize, and export geological and construction profiles.' }}
    </div>

    <div style="display: flex; flex-grow: 1;" />

    <div
      style="
        display: flex;
        align-items: center;
        gap: 44px;
        padding-top: 28px;
        border-top: 1px solid #d8dde3;
        font-size: 15px;
        letter-spacing: 0.02em;
        color: #7888a0;
      "
    >
      <div style="display: flex;">
        <span style="color: #0d1218; font-weight: 500; margin-right: 6px;">v1.0</span>
        <span>{{ badgeSpec || 'spec' }}</span>
      </div>
      <div style="display: flex;">
        <span style="color: #0d1218; font-weight: 500; margin-right: 6px;">Apache 2.0</span>
        <span>{{ badgeLicense || 'license' }}</span>
      </div>
      <div style="display: flex; color: #0d1218; font-weight: 500;">
        {{ badgeSite || 'welldot.org' }}
      </div>
    </div>
  </div>
</template>
