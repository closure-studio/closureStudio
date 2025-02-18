<template>
  <div tabindex="0" @click="start" role="button" class="btn btn-xs m-1 btn-warning">
    <span v-if="isQuerying" class="loading loading-bars loading-xs"></span>
    <span v-else>高智能问答</span>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";

interface SSEData {
  msg?: string;
}

// 事件消息的接口
interface StreamData {
  event: string;
  data: SSEData;
}


interface Props {
  title: string;
  token: string;
  updateQAContent?: (content: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  token: "",
  updateQAContent: (content: string) => { },
});


// export default defineComponent({
//   name: "QaSseClient",
//   setup() {
//     const messages = ref<Array<{ id: number; type: string; data: string }>>([]);

//     return { messages, sendRequest };
//   },
// });

const isQuerying = ref(false);
const QAContent = ref<string>("");
const start = async () => {
  if (isQuerying.value) return;
  isQuerying.value = !isQuerying.value;
  QAContent.value = "";
  props.updateQAContent(QAContent.value);
  await sendRequest();
};

const sendRequest = () => {
  //   axios
  //     .post(
  //       "https://api.chat.ltsc.vip/api/chat/query",
  //       { query: props.title, stream: true },
  //       {
  //         headers: {
  //           Accept: "text/event-stream",
  //           Authorization: "Bearer " + props.token,
  //         },
  //         responseType: "stream",
  //         adapter: "fetch", // <- this option can also be set in axios.create()
  //       }
  //     )
  //     .then(async (response) => {
  //       console.log("axios got a response");
  //       const stream = response.data;
  //       // consume response
  //       const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
  //       while (true) {
  //         const { value, done } = await reader.read();
  //         if (done) { isQuerying.value = false; break; };
  //         console.log(value);
  //         const parsedValue: StreamData = JSON.parse(value); // 解析字符串为JSON
  //         QAContent.value = parsedValue.data.msg || parsedValue.data.data || "";
  //         if (parsedValue.event === "progress" || parsedValue.event === "delta") {
  //           if (parsedValue.data.data) {
  //             QAContent.value += parsedValue.data.data;
  //             props.updateQAContent(QAContent.value);
  //           }
  //         }
  //         if (parsedValue.event === "set_text") {
  //           QAContent.value = "";
  //           props.updateQAContent(QAContent.value);
  //         }
  //         console.log(value);
  //       }
  //     });
  // };
  axios
    .post(
      "https://api.chat.ltsc.vip/api/chat/query",
      { query: props.title, stream: true },
      {
        headers: {
          Accept: "text/event-stream",
          Authorization: "Bearer " + props.token,
        },
        responseType: "stream",
        adapter: "fetch", // 使用 fetch 适配器处理流
      }
    )
    .then(async (response) => {
      console.log("axios got a response");
      const stream = response.data;

      // 初始化一个临时字符串用于存储可能的分块事件数据
      let eventString = '';

      // 使用 TextDecoder 流式处理文本
      const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) { isQuerying.value = false; break; };

        // 将新的chunk添加到事件字符串中
        eventString += value;

        // 检查是否包含完整的事件
        while (eventString.includes('\n\n')) {
          const eventEndIndex = eventString.indexOf('\n\n');
          const fullEvent = eventString.substring(0, eventEndIndex);
          eventString = eventString.substring(eventEndIndex + 2);

          // 处理完整的事件
          const lines = fullEvent.split('\n');
          const eventType = lines[0].split(': ')[1];
          if (eventType === 'delta' || eventType === 'progress') {
            let data = "";
            try {
              const tempData = JSON.parse(lines[1].split(': ')[1]);
              if (tempData.msg) {
                data = tempData.msg;
              }
              if (tempData.data) {
                data = tempData.data;
              }
            } catch (e) {
              data = lines[1].split(':"')[1].slice(0, -2);
              // remove \n
              data = data.replace(/\\n/g, '\n');
            }
            console.log('Event:', eventType, 'Data:', data);
            if (data) {
              QAContent.value += data;
              props.updateQAContent(QAContent.value);
            }
          }
          if (eventType === 'set_text') {
            QAContent.value = "";
            props.updateQAContent(QAContent.value);
          }
          if (eventType === 'end') {
            console.log('End of stream');
            isQuerying.value = false;
            break;
          }
        }
      }
    })
    .catch(error => {
      isQuerying.value = false;
      console.error('Error fetching the stream:', error);
    });
};
// catch/etc.

</script>
