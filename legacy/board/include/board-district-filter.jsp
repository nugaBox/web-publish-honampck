<%-- 게시판 상단(hderCn) 시찰·분류 탭 — searchCtgry와 동일 값으로 .on 출력 (첫 페인트 깜빡임 방지) --%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<div class="group-tabs board-district-filter" role="group" aria-label="시찰 구분">
	<button type="button" data-category=""<c:if test="${empty param.searchCtgry}"> class="on"</c:if>>전체</button>
	<c:forEach var="code" items="${searchCtgryList}">
	<button type="button" data-category="<c:out value="${code.value}" />"<c:if test="${param.searchCtgry eq code.value}"> class="on"</c:if>><c:out value="${code.name}" /></button>
	</c:forEach>
</div>
