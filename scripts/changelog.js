function toggleChangelog() {
  const changelogContent = document.querySelector('.changelog-content');
  const toggleBtn = document.querySelector('.toggle-btn');
  
  changelogContent.classList.toggle('active');
  toggleBtn.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function() {
  const changelogItems = document.querySelectorAll('.changelog-item');
  
  changelogItems.forEach(item => {
    item.addEventListener('click', function() {
      changelogItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });
});