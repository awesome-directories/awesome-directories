<template>
  <a
    href="https://www.producthunt.com/products/awesome-directories"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
    aria-label="View on Product Hunt (opens in new tab)"
  >
    <svg
      class="w-5 h-5"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
        fill="white"
      />
      <path
        d="M13 13V27H17V21H21C23.7614 21 26 18.7614 26 16C26 13.2386 23.7614 11 21 11H13V13ZM17 17V15H21C22.1046 15 23 15.8954 23 17C23 18.1046 22.1046 19 21 19H17V17Z"
        fill="currentColor"
        class="text-orange-600"
      />
    </svg>
    <span class="font-medium text-sm">Product Hunt</span>
  </a>
</template>

<script>
export default {
  name: "ProductHuntBadge",
};
</script>
