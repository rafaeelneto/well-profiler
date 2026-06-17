<template>
  <Html class="h-full overflow-hidden">
    <Body class="h-full overflow-x-hidden">
      <NuxtRouteAnnouncer />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <ConfirmDialog>
        <template #message="{ message }">
          <div class="flex items-start gap-3">
            <Icon
              v-if="message.icon"
              :name="message.icon"
              class="size-5 text-warning-500 shrink-0 mt-0.5"
            />
            <p class="text-sm leading-relaxed text-content-200">{{ message.message }}</p>
          </div>
        </template>
      </ConfirmDialog>
      <DynamicDialog />
    </Body>
  </Html>
</template>
