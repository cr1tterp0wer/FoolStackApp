<template>
  <div>
    <!-- Contact Section -->
    <section
      id='contact'
      class='section-style'
      data-background-image='@/assets/kite/images/background/contact.jpg'
    >
      <div class='pattern height-resize'>
        <div class='container'>
          <h3 class='section-name'>
            <span>
              Contact
            </span>
          </h3>
          <!-- /.section-name -->
          <h2 class='section-title'>
            Get in Touch
          </h2>
          <hr>
          <!-- /.Section-title  -->
          <h3 class='section-description'>
          Found a bug? Want to help? Questions comments and concerns can be sent directly to our
          <a href='about-us/#about'>talented dev team</a> at
          <a href="mailto:nusocial.contact@gmail.com">nusocial.contact@gmail.com</a>
          </h3>
          <!-- /.section-description -->

          <!-- /#contact-form -->
          <div class='next-section'>
            <a href="#content"><span></span></a>
          </div>
          <!-- /.next-section -->
        </div>
        <!-- /.container -->
      </div>
      <!-- /.pattern -->
    </section>
    <!-- /#contact -->
    <!-- Contact Section End -->

    <!-- Footer Section -->
    <Footer />
  </div>
</template>

<script>
import Footer from './Footer.vue';

export default {
  name: 'ContactUs',
  components: {
    Footer,
  },
};
</script>
<style>
@import '../assets/kite/assets/css/style.css';
@import '../assets/kite/assets/css/font-awesome.min.css';

#footer-section {
  background-color: white;
}
</style>
