<template>
  <div>
    <section
      id='page-top'
      class='section-style'
      data-background-image='@/assets/kite/images/background/top.jpg'
    >
      <div class='pattern height-resize'>
        <div class='container'>
          <h1 class='site-title' style='color:white !important;'>
            NU Social
          </h1>
          <!-- /.site-title -->
          <h3 class='section-name' style='color:white !important;'>
            <span>
              We Are
            </span>
          </h3>
          <!-- /.section-name -->
          <h2 class='section-title' style='color:white !important;'>
            Coming Soon
          </h2>
          <!-- /.Section-title  -->
          <div id='time_countdown' style='color:white !important;' class='time-count-container'>
            <div class='col-sm-3'>
              <div class='time-box'>
                <div
                  class='time-box-inner dash days_dash animated'
                  data-animation='rollIn'
                  data-animation-delay='300'
                >
                  <span class='time-number'>
                    <span class='digit'>{{ days }}</span>
                  </span>
                  <span class='time-name'>Days</span>
                </div>
              </div>
            </div>

            <div class='col-sm-3'>
              <div class='time-box'>
                <div
                  class='time-box-inner dash hours_dash animated'
                  data-animation='rollIn'
                  data-animation-delay='600'
                >
                  <span class='time-number'>
                    <span class='digit'>{{ hours }}</span>
                  </span>
                  <span class='time-name'>Hours</span>
                </div>
              </div>
            </div>

            <div class='col-sm-3'>
              <div class='time-box'>
                <div
                  class='time-box-inner dash minutes_dash animated'
                  data-animation='rollIn'
                  data-animation-delay='900'
                >
                  <span class='time-number'>
                    <span class='digit'>{{ minutes }}</span>
                  </span>
                  <span class='time-name'>Minutes</span>
                </div>
              </div>
            </div>

            <div class='col-sm-3'>
              <div class='time-box'>
                <div
                  class='time-box-inner dash seconds_dash animated'
                  data-animation='rollIn'
                  data-animation-delay='1200'
                >
                  <span class='time-number'>
                    <span class='digit'>{{ seconds }}</span>
                  </span>
                  <span class='time-name'>Seconds</span>
                </div>
              </div>
            </div>
          </div>
          <!-- /.time-count-container -->

          <p class='time-until'>
            <span>Time Until Launch</span>
          </p>
          <!-- /.time-until -->

          <div class='next-section'>
            <a href="#about" class='go-to-about'><span></span></a>
          </div>
          <!-- /.next-section -->
        </div>
        <!-- /.container -->
      </div>
      <!-- /.pattern -->
    </section>
    <!-- /#page-top -->
    <TeamMembers />
    <Footer />
  </div>
</template>
<script>
import TeamMembers from './TeamMembers.vue';
import Footer from '../components/Footer.vue';

export default {
  name: 'LandingPage',
  components: {
    TeamMembers,
    Footer,
  },
  data() {
    return {
      start: '',
      end: '',
      days: '',
      minutes: '',
      hours: '',
      seconds: '',
    };
  },
  mounted() {
    this.start = new Date().getTime();
    this.end = new Date('Feb 27, 2021 16:00:00').getTime();
    // Update the count down every 1 second
    this.timerCount(this.start, this.end);
    this.interval = setInterval(() => {
      this.timerCount(this.start, this.end);
    }, 1000);
  },
  methods: {
    timerCount(start, end) {
      // Get todays date and time
      const now = new Date().getTime();

      // Find the distance between now an the count down date
      const distance = start - now;
      const passTime = end - now;

      if (distance < 0 && passTime < 0) {
        this.statusType = 'expired';
        clearInterval(this.interval);
      } else if (distance < 0 && passTime > 0) {
        this.calcTime(passTime);
        this.statusType = 'running';
      } else if (distance > 0 && passTime > 0) {
        this.calcTime(distance);
        this.statusType = 'upcoming';
      }
    },
    calcTime(dist) {
      // Time calculations for days, hours, minutes and seconds
      this.days = Math.floor(dist / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((dist % (1000 * 60)) / 1000);
    },
  },
};
</script>

<style lang='scss'>
@import '../assets/kite/assets/css/style.css';
@import '../assets/kite/assets/css/font-awesome.min.css';
@import '../assets/kite/assets/css/bootstrap.min.css';

body {
  font-family: 'Roboto', sans-serif !important;
  color: #fff !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}

.time-name,
.time-number,
.section-title span,
.section-name span,
.site-title {
  color: white !important;
}
.navbar {
  .navbar-toggler,
  #nav-collapse {
    display: none !important;
  }
  margin-bottom: 0 !important;
  border-radius: 0;
}
</style>
