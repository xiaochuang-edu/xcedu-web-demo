<template>
  <section class="app-email-section">
    <navbar />
    <router-view />
  </section>
</template>
<script>
import navbar from '@page/navbar.vue'
export default {
  components: { navbar }
}
</script>
