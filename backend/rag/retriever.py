from typing import List, Dict, Any, Optional
from rag.vectorstore import AgriVectorStore


class AgriculturalRetriever:
    def __init__(self, vectorstore: AgriVectorStore):
        self.vectorstore = vectorstore

    def retrieve(
        self,
        query: str,
        crop: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant agricultural passages matching the farmer's query and crop context.
        """
        return self.vectorstore.search(
            query=query,
            top_k=top_k,
            crop_filter=crop,
            category_filter=category
        )

    def get_relevant_context(
        self,
        query: str,
        crop: Optional[str] = None,
        top_k: int = 4
    ) -> str:
        """
        Returns a formatted markdown string of relevant agricultural passages for reasoning.
        """
        results = self.retrieve(query=query, crop=crop, top_k=top_k)
        if not results:
            return "No specific agricultural literature match found for query."

        context_blocks = []
        for i, res in enumerate(results, 1):
            title = res.get("metadata", {}).get("title", f"Document {i}")
            category = res.get("metadata", {}).get("category", "General")
            crop_meta = res.get("metadata", {}).get("crop", "Multi-crop")
            score = res.get("score", 0.0)
            content = res.get("content", "").strip()

            context_blocks.append(
                f"### [Source {i}] {title} (Crop: {crop_meta}, Category: {category}, Relevance: {score})\n{content}"
            )

        return "\n\n".join(context_blocks)
