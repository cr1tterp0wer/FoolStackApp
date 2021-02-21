<template>
  <section id="about" class="section-style"
  data-background-image="@/assets/kite/images/background/about-us.jpg">
    <div class="pattern height-resize">
      <div class="container">
        <h3 class="section-name">
          <span>
            About Us
          </span>
        </h3>
        <!-- /.section-name -->
        <h2 class="section-title" style="color:white !important;">
          We Are dedicated
        </h2>
        <!-- /.Section-title  -->
        <p class="section-description" style="color:white !important;">
        Our experienced team of top level problem solvers have put their passion for
        creativity to the test.
        We truly believe in the power of communication and design and their ability
        to simplify complex communicative problems, elevate experiences, as well as
        engage and inspire students everywhere.
        </p>
        <!-- /.section-description -->

        <div class="team-container">
          <div class="row">
            <div class="col-sm-4">
              <div class="team-member">
                <figure>
                  <img
                    id='nuSocialChristopher'
                    src="@/assets/kite/images/team/christopher-apodaca.jpg"
                    alt="Christopher Apodaca"
                  />
                  <figcaption>
                    <p class="member-name" style="color:white !important;">Christopher Apodaca</p>
                    <p class="designation" style="color:white !important;">
                      Software Engineer
                    </p>
                    <!-- /.designation -->
                  </figcaption>
                </figure>
                <div class="social-btn-container">
                  <div class="team-socail-btn">
                    <span class="social-btn-box facebook-btn-container">
                      <a href="https://christopher-apodaca.com" class="facebook-btn">
                        <i class="fa fa-facebook"></i> </a
                      ><!-- /.facebook-btn --> </span
                    ><!-- /.social-btn-box -->

                    <span class="social-btn-box twitter-btn-container">
                      <a href="https://christopher-apodaca.com" class="twitter-btn">
                        <i class="fa fa-twitter"></i> </a
                      ><!-- /.twitter-btn --> </span
                    ><!-- /.social-btn-box -->

                    <span class="social-btn-box linkedin-btn-container">
                      <a href="https://www.linkedin.com/in/christopher-apodaca/" class="linkedin-btn">
                        <i class="fa fa-linkedin"></i> </a
                      ><!-- /.linkedin-btn --> </span
                    ><!-- /.social-btn-box -->

                    <span class="social-btn-box github-btn-container">
                      <a href="https://github.com/cr1tterp0wer" class="github-btn">
                        <i class="fa fa-github-alt"></i> </a
                      ><!-- /.github-btn --> </span
                    ><!-- /.social-btn-box -->
                  </div>
                  <!-- /.team-socail-btn -->
                </div>
                <!-- /.social-btn-container -->
              </div>
              <!-- /.team-member -->
            </div>
            <!-- /.col-sm-4 -->

            <div class="col-sm-4">
              <div class="team-member">
                <figure>
                  <img src="@/assets/kite/images/team/Elliot-Brown.jpg" alt="Team Member" />
                  <figcaption>
                    <p class="member-name" style="color:white !important;" >
                     Elliot Brown
                    </p>
                    <!-- /.member-name -->
                    <p class="designation" style="color:white !important;">
                      Designer
                    </p>
                    <!-- /.designation -->
                  </figcaption>
                </figure>
                <div class="social-btn-container">
                  <div class="team-socail-btn">
                    <span class="social-btn-box linkedin-btn-container">
                      <a href="https://www.linkedin.com/in/elliot-brown-163098167/" class="linkedin-btn">
                        <i class="fa fa-linkedin"></i> </a
                      ><!-- /.linkedin-btn --> </span
                    ><!-- /.social-btn-box -->
                  </div>
                  <!-- /.team-socail-btn -->
                </div>
                <!-- /.social-btn-container -->
              </div>
              <!-- /.team-member -->
            </div>
            <!-- /.col-sm-4 -->

            <div class="col-sm-4">
              <div class="team-member">
                <figure>
                  <img src="@/assets/kite/images/team/Dylan_kinzer.jpeg" alt="Team Member" />
                  <figcaption>
                    <p class="member-name" style="color:white !important;">
                      Dylan Kinzer
                    </p>
                    <!-- /.member-name -->
                    <p class="designation" style="color:white !important;">
                      Project Manager
                    </p>
                    <!-- /.designation -->
                  </figcaption>
                </figure>
                <div class="social-btn-container">
                  <div class="team-socail-btn">
                    <span class="social-btn-box linkedin-btn-container">
                      <a href="https://www.linkedin.com/in/dylan-kinzer/" class="linkedin-btn">
                        <i class="fa fa-linkedin"></i> </a
                      ><!-- /.linkedin-btn --> </span
                    ><!-- /.social-btn-box -->
                  </div>
                  <!-- /.team-socail-btn -->
                </div>
                <!-- /.social-btn-container -->
              </div>
              <!-- /.team-member -->
            </div>
            <!-- /.col-sm-4 -->

            <div class="col-sm-4">
              <div class="team-member">
                <figure>
                  <img src="@/assets/kite/images/team/unkown.gif" alt="Team Member" />
                  <figcaption>
                    <p class="member-name" style="color:white !important;">
                      Wilbur Agullana
                    </p>
                    <!-- /.member-name -->
                    <p class="designation" style="color:white !important;">
                      Developer
                    </p>
                    <!-- /.designation -->
                  </figcaption>
                </figure>
                <div class="social-btn-container">
                  <div class="team-socail-btn">
                  </div>
                  <!-- /.team-socail-btn -->
                </div>
                <!-- /.social-btn-container -->
              </div>
              <!-- /.team-member -->
            </div>
            <!-- /.col-sm-4 -->
          </div>
          <!-- /.row -->
        </div>
        <!-- /.team-container -->

        <div class="next-section">
          <a class="go-to-subscribe"><span></span></a>
        </div>
        <!-- /.next-section -->
      </div>
      <!-- /.container -->
    </div>
    <!-- /.pattern -->
  </section>
  <!-- /#about -->
  <!-- About Us Section End -->
</template>
<script>
export default {
  name: 'TeamMembers',
};
</script>
<style scoped lang="scss">
@import "../assets/kite/assets/css/style.css";
@import "../assets/kite/assets/css/font-awesome.min.css";
@import "../assets/kite/assets/css/bootstrap.min.css";

.time-name,
.time-number,
.section-title span,
.section-name span,
.site-title {
  color: white !important;
}

</style>
