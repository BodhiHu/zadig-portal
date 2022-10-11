<template>
  <div class="module-use">
    <header>Template Reference</header>
    <section>
      <div class="desc">Current Template Version：{{ info.version }}</div>
      <el-table :data="info.used" style="width: 100%;">
        <el-table-column prop="project_name" label="Project"></el-table-column>
        <el-table-column prop="service_name" label="Serve"></el-table-column>
        <el-table-column prop="version" label="Template Version"></el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
export default {
  props: {
    info: {
      require: false, // true
      type: Object,
      default: () => {
        return {
          version: '',
          used: []
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.module-use {
  box-sizing: border-box;
  height: 100%;
  padding: 10px 20px 20px;
  background-color: #fff;

  header {
    padding: 20px 0;
    font-weight: 700;
    font-size: 16px;
    line-height: 1;
  }

  section {
    .desc {
      font-size: 14px;
      line-height: 2;
    }
  }
}
</style>
