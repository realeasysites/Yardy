/*
 * EASY-EDIT DATA FILE
 * To add a gallery photo: drop it in /public/images/gallery/ and add a line below.
 * "wide: true" spans two columns, "tall: true" spans two rows.
 * "pos" sets which part of the photo stays in frame when it gets cropped
 *   (e.g. '50% 10%' keeps the top, so people's heads don't get cut off).
 *
 * Kitchen hours drive the "Open now / Closed" pill. Days: 0 = Sunday … 6 = Saturday.
 * Times are 24-hour, Maine time. Leave a day out to mark it closed.
 * (Also update the hours table + footer in index.html if these change.)
 */
window.SITE_DATA = {
  hours: {
    2: ['11:00', '19:00'], // Tue
    3: ['11:00', '19:00'], // Wed
    4: ['11:00', '19:00'], // Thu
    5: ['11:00', '20:00'], // Fri
    6: ['11:00', '20:00']  // Sat
  },

  gallery: [
    { src: '/images/gallery/jerk-plate.jpg', alt: 'Jerk chicken with festivals, plantains, mac and cheese and a Jamaican ginger beer', wide: true, tall: true },
    { src: '/images/gallery/crew-mural.jpg', alt: 'The Yardie Ting owners in front of the kitchen mural', wide: true, pos: '50% 6%' },
    { src: '/images/gallery/oxtail-ting.jpg', alt: 'Oxtail plate with rice, plantains and coleslaw with a Ting' },
    { src: '/images/gallery/takeout-spread.jpg', alt: 'A spread of Yardie Ting takeout plates and loaded fries' },
    { src: '/images/gallery/the-counter.jpg', alt: 'Ordering at the Yardie Ting counter under the hummingbird banner', wide: true, pos: '50% 22%' },
    { src: '/images/gallery/public-market-house.jpg', alt: 'The Public Market House at 28 Monument Square, Portland', wide: true }
  ]
};
