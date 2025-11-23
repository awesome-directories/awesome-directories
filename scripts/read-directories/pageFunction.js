async function pageFunction(context) {
  var page = context.page;
  var request = context.request;
  var log = context.log;
  var enqueueRequest = context.enqueueRequest;
  var customData = context.customData;
  var pushData = context.pushData;

  var currentDepth = request.userData.depth || 0;
  var baseUrl = new URL(request.loadedUrl);
  var isHomeDomain = function (url) {
    try {
      return new URL(url).hostname === baseUrl.hostname;
    } catch {
      return false;
    }
  };

  log.info(`Processing: ${request.url} (Depth: ${currentDepth})`);

  log.info(`Starting link extraction for ${request.url}`);
  var linkData = await page.evaluate(function () {
    var links = Array.from(document.querySelectorAll("a[href]"));
    return links.map(function (link) {
      return {
        href: link.href,
        text: link.innerText?.trim() || "",
        rel: link.getAttribute("rel") || "",
        isDoFollow: !link.getAttribute("rel")?.includes("nofollow"),
        isExternal: link.hostname !== window.location.hostname,
        title: link.getAttribute("title") || "",
        classes: link.className,
      };
    });
  });
  log.info(`Extracted ${linkData.length} links from ${request.url}`);

  log.info(`Starting page content analysis for ${request.url}`);
  var pageContent = await page.evaluate(function () {
    var bodyText = document.body.innerText.toLowerCase();
    var allText = document.documentElement.innerText.toLowerCase();

    var pricingKeywords = [
      "free",
      "paid",
      "premium",
      "pricing",
      "price",
      "cost",
      "$",
      "€",
      "£",
      "usd",
      "eur",
      "gbp",
      "payment",
      "subscription",
      "plan",
      "tier",
      "package",
    ];

    var hasPricing = pricingKeywords.some(function (kw) {
      return bodyText.includes(kw);
    });

    var pricingElements = Array.from(
      document.querySelectorAll(
        [
          '[class*="price"]',
          '[class*="pricing"]',
          '[id*="price"]',
          '[id*="pricing"]',
          '[class*="plan"]',
          '[class*="tier"]',
        ].join(","),
      ),
    ).map(function (el) {
      return {
        text: el.innerText?.trim(),
        html: el.innerHTML,
        classes: el.className,
      };
    });

    var freeIndicators = [
      "free",
      "no cost",
      "no charge",
      "$0",
      "free forever",
      "free tier",
    ];
    var paidIndicators = [
      "paid",
      "premium",
      "$",
      "payment required",
      "upgrade",
      "pro plan",
    ];

    var hasFree = freeIndicators.some(function (ind) {
      return bodyText.includes(ind);
    });
    var hasPaid = paidIndicators.some(function (ind) {
      return bodyText.includes(ind);
    });

    var submissionKeywords = [
      "submit",
      "submission",
      "add your",
      "list your",
      "register",
      "sign up",
      "join",
      "get listed",
      "add listing",
      "create listing",
      "submit site",
      "submit product",
      "submit startup",
    ];

    var submissionElements = Array.from(document.querySelectorAll("a, button"))
      .filter(function (el) {
        var text = el.innerText?.toLowerCase() || "";
        return submissionKeywords.some(function (kw) {
          return text.includes(kw);
        });
      })
      .map(function (el) {
        return {
          text: el.innerText?.trim(),
          href: el.href || "",
          type: el.tagName.toLowerCase(),
          classes: el.className,
        };
      });

    var forms = Array.from(document.querySelectorAll("form")).map(
      function (form) {
        return {
          action: form.action,
          method: form.method,
          fields: Array.from(
            form.querySelectorAll("input, textarea, select"),
          ).map(function (field) {
            return {
              name: field.name,
              type: field.type,
              required: field.required,
              placeholder: field.placeholder,
            };
          }),
        };
      },
    );

    var metaTags = {};
    document.querySelectorAll("meta").forEach(function (meta) {
      var name = meta.getAttribute("name") || meta.getAttribute("property");
      var content = meta.getAttribute("content");
      if (name && content) {
        metaTags[name] = content;
      }
    });

    var emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    var emails = [...new Set(allText.match(emailRegex) || [])];

    return {
      title: document.title,
      description: metaTags.description || metaTags["og:description"] || "",
      keywords: metaTags.keywords || "",
      hasPricing: hasPricing,
      pricingElements: pricingElements,
      hasFree: hasFree,
      hasPaid: hasPaid,
      submissionElements: submissionElements,
      forms: forms,
      emails: emails,
      metaTags: metaTags,
      bodyLength: bodyText.length,
    };
  });
  log.info(
    `Page content analysis complete. Title: "${pageContent.title}", Forms found: ${pageContent.forms.length}, Emails found: ${pageContent.emails.length}`,
  );

  log.info(`Analyzing dofollow link statistics for ${request.url}`);
  var totalLinks = linkData.length;
  var doFollowLinks = linkData.filter(function (l) {
    return l.isDoFollow;
  }).length;
  var noFollowLinks = totalLinks - doFollowLinks;
  var externalLinks = linkData.filter(function (l) {
    return l.isExternal;
  }).length;
  var externalDoFollow = linkData.filter(function (l) {
    return l.isExternal && l.isDoFollow;
  }).length;
  log.info(
    `Link stats - Total: ${totalLinks}, DoFollow: ${doFollowLinks}, NoFollow: ${noFollowLinks}, External: ${externalLinks}, External DoFollow: ${externalDoFollow}`,
  );

  log.info(`Checking directory features for ${request.url}`);
  var directoryFeatures = await page.evaluate(function () {
    var features = {
      hasSearch: !!document.querySelector(
        'input[type="search"], [class*="search"]',
      ),
      hasCategories: !!document.querySelector(
        '[class*="categor"], [id*="categor"]',
      ),
      hasTags: !!document.querySelector('[class*="tag"], [id*="tag"]'),
      hasRatings: !!document.querySelector(
        '[class*="rating"], [class*="star"], [id*="rating"]',
      ),
      hasReviews: !!document.querySelector('[class*="review"], [id*="review"]'),
      hasFilters: !!document.querySelector('[class*="filter"], [id*="filter"]'),
      hasSorting: !!document.querySelector('[class*="sort"], [id*="sort"]'),
    };

    var listingSelectors = [
      '[class*="listing"]',
      '[class*="item"]',
      '[class*="card"]',
      '[class*="entry"]',
      '[class*="directory"]',
    ];

    features.estimatedListings = Math.max(
      ...listingSelectors.map(function (sel) {
        return document.querySelectorAll(sel).length;
      }),
    );

    return features;
  });
  log.info(
    `Directory features detected - Search: ${directoryFeatures.hasSearch}, Categories: ${directoryFeatures.hasCategories}, Estimated listings: ${directoryFeatures.estimatedListings}`,
  );

  log.info(`Determining submission model for ${request.url}`);
  var submissionModel = "unknown";
  if (pageContent.hasFree && !pageContent.hasPaid) {
    submissionModel = "free";
  } else if (pageContent.hasPaid && !pageContent.hasFree) {
    submissionModel = "paid";
  } else if (pageContent.hasFree && pageContent.hasPaid) {
    submissionModel = "freemium";
  }
  log.info(
    `Submission model determined: ${submissionModel} (hasFree: ${pageContent.hasFree}, hasPaid: ${pageContent.hasPaid})`,
  );

  log.info(`Compiling results for ${request.url}`);
  var result = {
    url: request.url,
    loadedUrl: request.loadedUrl,
    depth: currentDepth,
    timestamp: new Date().toISOString(),
    directoryName: request.userData.directoryName || "",

    title: pageContent.title,
    description: pageContent.description,

    seo: {
      totalLinks: totalLinks,
      doFollowLinks: doFollowLinks,
      noFollowLinks: noFollowLinks,
      doFollowPercentage:
        totalLinks > 0 ? ((doFollowLinks / totalLinks) * 100).toFixed(2) : 0,
      externalLinks: externalLinks,
      externalDoFollow: externalDoFollow,
      externalDoFollowPercentage:
        externalLinks > 0
          ? ((externalDoFollow / externalLinks) * 100).toFixed(2)
          : 0,
      metaDescription: pageContent.description,
      metaKeywords: pageContent.keywords,
    },

    pricing: {
      model: submissionModel,
      hasFree: pageContent.hasFree,
      hasPaid: pageContent.hasPaid,
      pricingElements: pageContent.pricingElements.slice(0, 5),
    },

    submission: {
      hasSubmissionForm: pageContent.forms.length > 0,
      submissionButtons: pageContent.submissionElements.slice(0, 10),
      forms: pageContent.forms.map(function (f) {
        return {
          action: f.action,
          method: f.method,
          fieldCount: f.fields.length,
          requiredFields: f.fields.filter(function (field) {
            return field.required;
          }).length,
        };
      }),
    },

    features: directoryFeatures,

    contact: {
      emails: pageContent.emails.slice(0, 5),
    },

    sampleLinks: {
      doFollow: linkData
        .filter(function (l) {
          return l.isDoFollow && l.isExternal;
        })
        .slice(0, 5),
      noFollow: linkData
        .filter(function (l) {
          return !l.isDoFollow && l.isExternal;
        })
        .slice(0, 5),
    },
  };
  log.info(`Results compiled successfully for ${request.url}`);

  var resultLength = JSON.stringify(result).length;
  var humanReadableSize = (resultLength / 1024).toFixed(2) + " KB";
  log.info(
    `Result data size for ${request.url}: ${resultLength} bytes (${humanReadableSize})`,
  );

  log.info(`Saving result to dataset for ${request.url}`);
  await pushData(result);
  log.info(`Result saved successfully to dataset for ${request.url}`);

  log.info(
    `Checking if internal links should be enqueued (currentDepth: ${currentDepth}, maxInternalDepth: ${customData.maxInternalDepth})`,
  );
  if (currentDepth < customData.maxInternalDepth) {
    var internalLinks = linkData
      .filter(function (link) {
        try {
          var linkUrl = new URL(link.href);
          return linkUrl.hostname === baseUrl.hostname;
        } catch {
          return false;
        }
      })
      .slice(0, 10);

    log.info(
      `Found ${internalLinks.length} internal links to potentially enqueue`,
    );

    var enqueuedInternal = 0;
    for (var i = 0; i < internalLinks.length; i++) {
      var link = internalLinks[i];
      if (link.href && !link.href.includes("#")) {
        await enqueueRequest({
          url: link.href,
          userData: {
            label: "DIRECTORY_INTERNAL",
            depth: currentDepth + 1,
            directoryName: request.userData.directoryName,
          },
        });
        enqueuedInternal++;
      }
    }
    log.info(`Enqueued ${enqueuedInternal} internal links from ${request.url}`);
  } else {
    log.info(
      `Skipping internal link enqueuing - max depth reached (${currentDepth} >= ${customData.maxInternalDepth})`,
    );
  }

  log.info(
    `Checking if external links should be enqueued (currentDepth: ${currentDepth}, maxExternalDepth: ${customData.maxExternalDepth})`,
  );
  if (currentDepth === 0 && customData.maxExternalDepth > 0) {
    var externalLinks = linkData
      .filter(function (link) {
        try {
          var linkUrl = new URL(link.href);
          return linkUrl.hostname !== baseUrl.hostname;
        } catch {
          return false;
        }
      })
      .slice(0, 5);

    log.info(
      `Found ${externalLinks.length} external links to potentially enqueue`,
    );

    var enqueuedExternal = 0;
    for (var j = 0; j < externalLinks.length; j++) {
      var extLink = externalLinks[j];
      if (extLink.href) {
        await enqueueRequest({
          url: extLink.href,
          userData: {
            label: "EXTERNAL_PAGE",
            depth: 1,
          },
        });
        enqueuedExternal++;
      }
    }
    log.info(`Enqueued ${enqueuedExternal} external links from ${request.url}`);
  } else {
    log.info(
      `Skipping external link enqueuing - currentDepth: ${currentDepth}, maxExternalDepth: ${customData.maxExternalDepth}`,
    );
  }

  log.info(
    `Extracted data from ${request.url}: ${submissionModel} model, ${doFollowLinks}/${totalLinks} dofollow links`,
  );
}
