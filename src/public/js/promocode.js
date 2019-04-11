function promocode(form) {
  const data = {
    name: form.querySelector('input[name=name]').value,
    arguments: {
      age: form.querySelector('input[name=age]').value,
      meteo: {
        town: form.querySelector('input[name=city]').value
      }
    }
  };
  $.post({
    url: '/promocode',
    data: JSON.stringify(data),
    success: (result) => {
      $('div#result').html(
        result.status + '<br>' + result.reasons.join('<br>')
      )
    },
    dataType: 'json',
    contentType: 'application/json'
  });
}
