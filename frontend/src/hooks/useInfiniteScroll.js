import { useCallback, useRef } from "react"

const useInfiniteScroll = ({loading, hasMore, setPage}) =>{
  const observerRef = useRef(null);

  const lastElementRef = useCallback((node) =>{
    if (loading || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) =>{
      if (entries[0].isIntersecting){
        setPage((prevPage) => prevPage + 1);
      }
    }, { threshold: 0.5 })

    if (node){
      observerRef.current.observe(node);
    }
  }, [loading, hasMore])

  return lastElementRef;
}

export default useInfiniteScroll;