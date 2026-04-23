import Giscus from '@giscus/react';

export default function GiscusComments() {
  return (
    <Giscus
      id="comments"
      repo="gw-lim/gw-lim-web"
      repoId="R_kgDOSKMI5w"
      category="Announcements"
      categoryId="DIC_kwDOSKMI584C7fHg"
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang="ko"
      loading="lazy"
    />
  );
}
