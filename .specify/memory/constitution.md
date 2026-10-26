<!--
Sync Impact Report
Versión: plantilla sin versión → 1.0.0 (adopción inicial).
Principios: los cinco espacios de la plantilla se sustituyen por los seis principios solicitados:
I. Simplicidad ante todo; II. Idioma y mercado; III. Cero alcance fantasma;
IV. Verificable por una persona no técnica; V. Datos del usuario con respeto;
VI. Pruebas primero.
Secciones añadidas: Alcance de la versión 1; Revisión de cada feature.
Secciones eliminadas: ninguna sección de gobierno vigente.
Pendientes: ninguno. Retirar este informe temporal antes de hacer commit.
-->
# Constitución de Chaska Store

## Core Principles

### I. Simplicidad ante todo

Entre dos soluciones que cumplan la spec, elegir siempre la más simple. La versión 1 resuelve
necesidades actuales; no incorpora complejidad para posibles necesidades futuras.

### II. Idioma y mercado

Todo el producto usa español de Perú. Los importes se muestran en soles, con el símbolo `S/`
y dos decimales; por ejemplo, `S/ 49.90`.

### III. Cero alcance fantasma

Solo se implementan funcionalidades escritas en la spec. Toda idea nueva se propone y espera
su aprobación e incorporación a la spec antes de construirse.

### IV. Verificable por una persona no técnica

Cada criterio de éxito describe acciones y resultados observables usando la app. Una persona
sin conocimientos técnicos debe poder comprobarlo sin leer código.

### V. Datos del usuario con respeto

Se piden solo los datos imprescindibles para el pedido. Las claves y los secretos nunca se
incluyen en el código. La clave del administrador y el número de WhatsApp se configuran mediante
variables de entorno, documentadas en `.env.example` con valores de ejemplo, sin secretos reales.

### VI. Pruebas primero

Toda regla de negocio tiene una prueba automática escrita y ejecutada que falla antes de
implementar la regla. Antes de cerrar una feature, `npm test` debe pasar.

## Alcance de la versión 1

Chaska Store es un catálogo virtual de productos electrónicos. El administrador agrega y quita
productos; los clientes envían su pedido por WhatsApp. La spec concreta este alcance bajo los
seis principios anteriores.

## Revisión de cada feature

Antes de implementar, comprobar que la funcionalidad está en la spec y que sus criterios se
pueden verificar desde la app. Antes de cerrar, revisar los seis principios, comprobar esos
criterios y ejecutar `npm test` con resultado satisfactorio.

## Governance

Esta constitución rige las especificaciones, los planes y las implementaciones. Cada revisión
de una feature comprueba su cumplimiento. Para modificarla, registrar el motivo, obtener la
aprobación del responsable del proyecto y actualizar la versión y la fecha de modificación.
La versión aumenta en MAJOR si se eliminan o redefinen principios de forma incompatible,
en MINOR si se añaden o amplían reglas y en PATCH si solo se aclara la redacción.

**Version**: 1.0.0 | **Ratified**: 2026-10-26 | **Last Amended**: 2026-10-26
